import { createSupabaseServerClient } from "@/lib/supabase/server";
import { InsightsPanel } from "@/components/InsightsPanel";
import { detectSpendingAlerts, forecastNextMonth, type TransactionForInsights } from "@/lib/analytics/insights";

export default async function InsightsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData!.user!.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency")
    .eq("id", userId)
    .single();

  const { data: rawTransactions } = await supabase
    .from("transactions")
    .select("amount, transaction_date, category_id, categories(name)")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: true });

  const transactions = (rawTransactions ?? []) as unknown as TransactionForInsights[];

  const alerts = detectSpendingAlerts(transactions);
  const forecast = forecastNextMonth(transactions);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Insights
        </h1>
        <p className="mt-1 text-sm text-[var(--text-tertiary)]">
          Spending pattern changes and a simple next-month forecast.
        </p>
      </div>
      <InsightsPanel alerts={alerts} forecast={forecast} currency={profile?.currency ?? "LKR"} />
    </div>
  );
}