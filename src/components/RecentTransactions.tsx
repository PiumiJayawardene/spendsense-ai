import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CategorySelector } from "./CategorySelector";
import { ReceiptIcon } from "@/components/ui/Icons";

export async function RecentTransactions() {
  const supabase = await createSupabaseServerClient();

  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      id,
      description,
      amount,
      transaction_date,
      categorized_by,
      category_id,
      categories(name, icon, color)
    `)
    .order("transaction_date", { ascending: false })
    .limit(200);

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-surface-sunken)] text-[var(--text-tertiary)]">
          <ReceiptIcon className="h-5 w-5" />
        </div>

        <p className="text-sm text-[var(--text-secondary)]">
          No transactions yet — upload a statement to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]">
      <div className="max-h-[700px] overflow-y-auto styled-scrollbar">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-[var(--bg-surface-sunken)] text-left text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
            <tr>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3 text-right">Amount</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border-subtle)]">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {transactions.map((txn: any) => (
              <tr
                key={txn.id}
                className="transition-colors hover:bg-[var(--bg-surface-sunken)]"
              >
                <td className="whitespace-nowrap px-5 py-3.5 text-[var(--text-tertiary)]">
                  {txn.transaction_date}
                </td>

                <td className="px-5 py-3.5 font-medium text-[var(--text-primary)]">
                  {txn.description}
                </td>

                <td className="px-5 py-3.5">
                  <CategorySelector
                    transactionId={txn.id}
                    categories={categories ?? []}
                    selectedCategoryId={txn.category_id}
                  />
                </td>
                   <td
  className={`whitespace-nowrap px-5 py-3.5 text-right font-semibold ${
    txn.amount < 0
      ? "text-[var(--negative)]"
      : "text-[var(--positive)]"
  }`}
>
                  {txn.amount < 0 ? "−" : "+"}
                  {Math.abs(txn.amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}