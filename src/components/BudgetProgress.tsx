import { AnimatedProgressBar } from "@/components/ui/AnimatedProgressBar";
import { Badge } from "@/components/ui/Badge";
import { BudgetIcon } from "@/components/ui/Icons";

interface BudgetRow {
  categoryName: string;
  icon: string | null;
  limitAmount: number;
  spent: number;
}

export function BudgetProgress({ budgets, currency }: { budgets: BudgetRow[]; currency: string }) {
  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-surface-sunken)] text-[var(--text-tertiary)]">
          <BudgetIcon className="h-5 w-5" />
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          No budgets set yet — use the form above to set your first one.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {budgets.map((b) => {
        const percent = b.limitAmount > 0 ? Math.min((b.spent / b.limitAmount) * 100, 100) : 0;
        const isOver = b.spent > b.limitAmount;
        const remaining = b.limitAmount - b.spent;

        return (
          <div
            key={b.categoryName}
            className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-sunken)] p-4"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)]">
                <span>{b.icon}</span>
                {b.categoryName}
              </span>
              {isOver ? (
                <Badge variant="negative">Over budget</Badge>
              ) : (
                <Badge variant="positive">{Math.round(percent)}% used</Badge>
              )}
            </div>

            <div className="mt-3">
              <AnimatedProgressBar percent={percent} isOver={isOver} />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-[var(--text-tertiary)]">
                {currency} {b.spent.toFixed(2)} of {b.limitAmount.toFixed(2)}
              </span>
              <span
                className={isOver ? "font-medium text-[var(--negative)]" : "text-[var(--text-tertiary)]"}
              >
                {isOver
                  ? `${currency} ${Math.abs(remaining).toFixed(2)} over`
                  : `${currency} ${remaining.toFixed(2)} left`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}