import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { retrieveRelevantTransactions } from "@/lib/ai/rag";
import { getChatCompletion } from "@/lib/ai/client";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json();
  const question: string = body.question;

  if (!question || typeof question !== "string" || question.trim().length === 0) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  const retrieved = await retrieveRelevantTransactions(authData.user.id, question);
const { data: profile } = await supabase
  .from("profiles")
  .select("currency")
  .eq("id", authData.user.id)
  .single();

const currency = profile?.currency ?? "LKR";
  if (retrieved.length === 0) {
    return NextResponse.json({
      answer:
        "I don't have any transaction data to answer that yet. Upload a bank statement first, and make sure a few seconds have passed for processing.",
      sourcesUsed: 0,
    });
  }

  const contextText = retrieved
    .map((r, i) => `${i + 1}. ${r.content} (relevance: ${(r.similarity * 100).toFixed(0)}%)`)
    .join("\n");

  const systemPrompt = `You are a helpful personal finance assistant. Answer the user's question using ONLY the transaction data provided below. Be specific with numbers. If the data doesn't fully answer the question, say so honestly rather than guessing. Keep your answer concise — 2-4 sentences unless the user asks for a detailed breakdown.The user's preferred currency is ${currency}. Always use ${currency} when referring to money. Never assume USD unless the transaction data explicitly says otherwise.

Answer the user's question using ONLY the transaction data provided below. Be specific with numbers. If the data doesn't fully answer the question, say so honestly rather than guessing. Keep your answer concise — 2-4 sentences unless the user asks for a detailed breakdown.

Transaction data:
${contextText}`;



  try {
    const answer = await getChatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.2,
    });

    return NextResponse.json({ answer, sourcesUsed: retrieved.length });
  } catch (err) {
    console.error("Chat completion failed:", err);
    return NextResponse.json(
      { error: "The AI assistant is unavailable right now. Make sure Ollama is running." },
      { status: 503 }
    );
  }
}