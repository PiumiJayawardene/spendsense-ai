import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UploadForm } from "@/components/UploadForm";
import { RecentTransactions } from "@/components/RecentTransactions";
import { SpendingPieChart } from "@/components/SpendingPieChart";
import { MonthlyTrendChart } from "@/components/MonthlyTrendChart";
import { StatCards } from "@/components/StatCards";
import { Card, CardHeader } from "@/components/ui/Card";
import { UploadIcon, InsightsIcon, ReceiptIcon } from "@/components/ui/Icons";
import {
  getCategoryBreakdown,
  getMonthlyTotals,
  getTotalIncome,
  getTotalExpenses,
  type TransactionForAnalytics,
} from "@/lib/analytics/spending";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const { data: authData } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency")
    .eq("id", authData!.user!.id)
    .single();

  const { data: rawTransactions } = await supabase
    .from("transactions")
    .select("amount, transaction_date, category_id, categories(name, color)")
    .order("transaction_date", { ascending: true });

  const transactions = (rawTransactions ?? []) as unknown as TransactionForAnalytics[];

  const categoryBreakdown = getCategoryBreakdown(transactions);
  const monthlyTotals = getMonthlyTotals(transactions);
  const totalIncome = getTotalIncome(transactions);
  const totalExpenses = getTotalExpenses(transactions);
  const currency = profile?.currency ?? "LKR";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Welcome to SpendSense AI
        </h1>
        <p className="mt-1 text-sm text-[var(--text-tertiary)]">
          Track spending, manage budgets and gain AI-powered financial insights.
          
        </p>
      </div>

      <StatCards totalIncome={totalIncome} totalExpenses={totalExpenses} currency={currency} />

      <Card>
        <CardHeader
          title="Upload a statement"
          subtitle="CSV or PDF — we'll parse and categorize it automatically"
          icon={<UploadIcon className="h-4 w-4" />}
        />
        <UploadForm />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Spending by category" icon={<InsightsIcon className="h-4 w-4" />} />
          <SpendingPieChart data={categoryBreakdown} />
        </Card>
        <Card>
          <CardHeader
            title="Income vs expenses by month"
            icon={<InsightsIcon className="h-4 w-4" />}
          />
          <MonthlyTrendChart data={monthlyTotals} />
        </Card>
      </div>

      <section>
        <CardHeader
          title="Recent transactions"
          icon={<ReceiptIcon className="h-4 w-4" />}
        />
        <RecentTransactions />
      </section>
    </div>
  );
}