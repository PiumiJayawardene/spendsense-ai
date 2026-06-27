import { Card } from "@/components/ui/Card";
import { ArrowUpIcon, ArrowDownIcon, WalletIcon } from "@/components/ui/Icons";

interface StatCardsProps {
  totalIncome: number;
  totalExpenses: number;
  currency: string;
}

export function StatCards({ totalIncome, totalExpenses, currency }: StatCardsProps) {
  const net = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (net / totalIncome) * 100 : 0;

  function format(n: number) {
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className="relative overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
            Total Income
          </p>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--positive-soft)] text-[var(--positive)]">
            <ArrowUpIcon className="h-3.5 w-3.5" />
          </span>
        </div>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          {currency} {format(totalIncome)}
        </p>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
            Total Expenses
          </p>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--negative-soft)] text-[var(--negative)]">
            <ArrowDownIcon className="h-3.5 w-3.5" />
          </span>
        </div>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          {currency} {format(totalExpenses)}
        </p>
      </Card>

      <Card className="relative overflow-hidden border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent-soft)] to-transparent">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
            Savings Rate
          </p>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
            <WalletIcon className="h-3.5 w-3.5" />
          </span>
        </div>
        <p
          className={`mt-3 text-2xl font-semibold tracking-tight ${
            savingsRate >= 0 ? "text-[var(--text-primary)]" : "text-[var(--negative)]"
          }`}
        >
          {savingsRate.toFixed(1)}%
        </p>
      </Card>
    </div>
  );
}