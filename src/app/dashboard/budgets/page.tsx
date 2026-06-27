import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BudgetForm } from "@/components/BudgetForm";
import { BudgetProgress } from "@/components/BudgetProgress";
import { Card, CardHeader } from "@/components/ui/Card";
import { BudgetIcon } from "@/components/ui/Icons";

export default async function BudgetsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData!.user!.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency")
    .eq("id", userId)
    .single();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, icon")
    .is("user_id", null)
    .order("name");

  const now = new Date();
  const periodMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const { data: budgetRows } = await supabase
    .from("budgets")
    .select("limit_amount, category_id, categories(name, icon)")
    .eq("user_id", userId)
    .eq("period_month", periodMonth);

  const { data: monthTransactions } = await supabase
    .from("transactions")
    .select("amount, category_id")
    .eq("user_id", userId)
    .gte("transaction_date", periodMonth)
    .lte("transaction_date", monthEnd)
    .lt("amount", 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const budgets = (budgetRows ?? []).map((b: any) => {
    const spent = (monthTransactions ?? [])
      .filter((t) => t.category_id === b.category_id)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      categoryName: b.categories?.name ?? "Unknown",
      icon: b.categories?.icon ?? null,
      limitAmount: b.limit_amount,
      spent,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Budgets
        </h1>
        <p className="mt-1 text-sm text-[var(--text-tertiary)]">
          Set monthly limits per category and track your progress.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Set a budget"
          subtitle="Choose a category and a monthly spending limit"
          icon={<BudgetIcon className="h-4 w-4" />}
        />
        <BudgetForm categories={categories ?? []} />
      </Card>

      <Card>
        <CardHeader title="This month's progress" icon={<BudgetIcon className="h-4 w-4" />} />
        <BudgetProgress budgets={budgets} currency={profile?.currency ?? "LKR"} />
      </Card>
    </div>
  );
}