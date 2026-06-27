import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseCsvStatement } from "@/lib/parsing/csv-parser";
import { parsePdfStatement } from "@/lib/parsing/pdf-parser";
import { ParseError } from "@/lib/parsing/types";
import { buildCategoryNameMap, categorizeBatchWithFallback } from "@/lib/categorization/engine";
import { embedTransactionBatch } from "@/lib/ai/embeddings";
import { parseCommercialBankStatement } from "@/lib/parsing/commercial-bank-parser";
import type { ParsedTransaction } from "@/lib/parsing/types";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData?.user) {
    return NextResponse.json(
      { error: "Not authenticated." },
      { status: 401 }
    );
  }

  const userId = authData.user.id;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "No file uploaded." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10MB." },
      { status: 400 }
    );
  }

  const fileName = file.name.toLowerCase();
  const isCsv = fileName.endsWith(".csv");
  const isPdf = fileName.endsWith(".pdf");

  if (!isCsv && !isPdf) {
    return NextResponse.json(
      { error: "Unsupported file type. Please upload a .csv or .pdf file." },
      { status: 400 }
    );
  }

  let parsedTransactions: ParsedTransaction[] = [];
  let parseWarnings: string[] = [];

  try {
    if (isCsv) {
      const text = await file.text();

      const result = parseCsvStatement(text);

      parsedTransactions = result.transactions;
      parseWarnings = result.warnings;
    } else {
  const buffer = Buffer.from(await file.arrayBuffer());

const result = await parseCommercialBankStatement(buffer);

parsedTransactions = result.transactions;
parseWarnings = result.warnings;
}
  } catch (err) {
    if (err instanceof ParseError) {
      return NextResponse.json(
        { error: err.message },
        { status: 422 }
      );
    }

    console.error("Unexpected parsing error:", err);

    return NextResponse.json(
      { error: "An unexpected error occurred while parsing the file." },
      { status: 500 }
    );
  }

  if (parsedTransactions.length === 0) {
    return NextResponse.json(
      {
        error: "No transactions could be extracted from this file.",
        warnings: parseWarnings,
      },
      { status: 422 }
    );
  }

  
  parsedTransactions = parsedTransactions.filter(
    (t) => Math.abs(t.amount) < 1000000
  );


  const { data: categories, error: categoriesError } =
    await supabase
      .from("categories")
      .select("id, name")
      .or(`user_id.is.null,user_id.eq.${userId}`);

  if (categoriesError) {
    console.error(
      "Failed to fetch categories:",
      categoriesError
    );

    return NextResponse.json(
      { error: "Failed to load categories for categorization." },
      { status: 500 }
    );
  }

const categoryNameMap = buildCategoryNameMap(categories ?? []);
  const categorizations = await categorizeBatchWithFallback(
    parsedTransactions.map((t) => ({ description: t.description, amount: t.amount })),
    categoryNameMap
  );
  const rowsToInsert = parsedTransactions.map((txn, i) => ({
    user_id: userId,
    description: txn.description,
    amount: txn.amount,
    transaction_date: txn.transactionDate,
    source: isCsv ? "csv_upload" : "pdf_upload",
    raw_row: txn.rawRow,
    category_id: categorizations[i].categoryId,
    categorized_by: categorizations[i].categorizedBy,
    categorization_confidence:
      categorizations[i].confidence,
  }));

  const { data: inserted, error: insertError } =
    await supabase
      .from("transactions")
      .insert(rowsToInsert)
      .select("id, categorized_by");

  if (insertError) {
    console.error(
      "Failed to insert transactions:",
      insertError
    );

    return NextResponse.json(
      { error: "Failed to save transactions to the database." },
      { status: 500 }
    );
  }

  if (inserted && inserted.length > 0) {
    const categoryNames = new Map<string, string>();
    for (const [name, id] of categoryNameMap.entries()) {
      categoryNames.set(id, name);
    }

    const transactionsForEmbedding = rowsToInsert.map((row, i) => ({
      id: inserted[i].id,
      description: row.description,
      amount: row.amount,
      transaction_date: row.transaction_date,
      categoryName: row.category_id ? categoryNames.get(row.category_id) ?? null : null,
    }));

    
    embedTransactionBatch(userId, transactionsForEmbedding).catch((err) =>
      console.error("Background embedding batch failed:", err)
    );
  }
const categorizedByRule = inserted?.filter((t) => t.categorized_by === "rule").length ?? 0;
  const categorizedByAi = inserted?.filter((t) => t.categorized_by === "ai").length ?? 0;
  const uncategorizedCount = (inserted?.length ?? 0) - categorizedByRule - categorizedByAi;

  return NextResponse.json({
    success: true,
    transactionsInserted: inserted?.length ?? 0,
    categorizedByRule,
    categorizedByAi,
    uncategorized: uncategorizedCount,
    warnings: parseWarnings,
  });
}