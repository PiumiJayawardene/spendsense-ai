import { getEmbedding } from "./client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface RetrievedTransaction {
  transaction_id: string;
  content: string;
  similarity: number;
}


export async function retrieveRelevantTransactions(
  userId: string,
  question: string,
  matchCount = 10
): Promise<RetrievedTransaction[]> {
  const queryEmbedding = await getEmbedding(question);

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc("match_transaction_embeddings", {
    query_embedding: queryEmbedding,
    match_user_id: userId,
    match_count: matchCount,
  });

  if (error) {
    console.error("RAG retrieval failed:", error);
    return [];
  }

  return data ?? [];
}
