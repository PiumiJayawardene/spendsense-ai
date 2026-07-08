export interface TransactionForAnalytics {
  amount: number;
  transaction_date: string;
  category_id: string | null;
  categories: { name: string; color: string | null } | null;
}

export interface CategoryBreakdown {
  categoryName: string;
  color: string;
  total: number;
}

export interface MonthlyTotal {
  month: string; // "2026-06"
  income: number;
  expenses: number;
}


export function getCategoryBreakdown(
  transactions: TransactionForAnalytics[]
): CategoryBreakdown[] {
  const totals = new Map<string, { total: number; color: string }>();

  for (const txn of transactions) {
    if (txn.amount >= 0) continue; // only expenses, not income

    const name = txn.categories?.name ?? "Uncategorized";
    const color = txn.categories?.color ?? "#94a3b8";
    const existing = totals.get(name);

    if (existing) {
      existing.total += Math.abs(txn.amount);
    } else {
      totals.set(name, { total: Math.abs(txn.amount), color });
    }
  }

  return Array.from(totals.entries())
    .map(([categoryName, { total, color }]) => ({ categoryName, color, total }))
    .sort((a, b) => b.total - a.total);
}


export function getMonthlyTotals(
  transactions: TransactionForAnalytics[]
): MonthlyTotal[] {
  const totals = new Map<string, { income: number; expenses: number }>();

  for (const txn of transactions) {
    const month = txn.transaction_date.slice(0, 7); // "2026-06-15" -> "2026-06"
    const existing = totals.get(month) ?? { income: 0, expenses: 0 };

    if (txn.amount >= 0) {
      existing.income += txn.amount;
    } else {
      existing.expenses += Math.abs(txn.amount);
    }

    totals.set(month, existing);
  }

  return Array.from(totals.entries())
    .map(([month, { income, expenses }]) => ({ month, income, expenses }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function getTotalIncome(transactions: TransactionForAnalytics[]): number {
  return transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
}

export function getTotalExpenses(transactions: TransactionForAnalytics[]): number {
  return transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}