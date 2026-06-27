import { getEmbedding } from "./client";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

interface TransactionForEmbedding {
  id: string;
  description: string;
  amount: number;
  transaction_date: string;
  categoryName: string | null;
}

function buildEmbeddingText(txn: TransactionForEmbedding): string {
  const type = txn.amount < 0 ? "expense" : "income";
  const category = txn.categoryName ?? "Uncategorized";
  return `On ${txn.transaction_date}, ${type} of ${Math.abs(txn.amount)} for "${txn.description}" in category ${category}.`;
}


export async function embedTransaction(
  userId: string,
  txn: TransactionForEmbedding
): Promise<void> {
  const content = buildEmbeddingText(txn);
  const embedding = await getEmbedding(content);

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("transaction_embeddings").upsert(
    {
      user_id: userId,
      transaction_id: txn.id,
      content,
      embedding,
    },
    { onConflict: "transaction_id" }
  );

  if (error) {
    console.error(`Failed to save embedding for transaction ${txn.id}:`, error);
  }
}


export async function embedTransactionBatch(
  userId: string,
  transactions: TransactionForEmbedding[]
): Promise<void> {
  for (const txn of transactions) {
    try {
      await embedTransaction(userId, txn);
    } catch (err) {
      console.error(`Embedding failed for transaction ${txn.id}:`, err);
    }
  }
}