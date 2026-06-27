import type { SpendingAlert, ForecastResult } from "@/lib/analytics/insights";
import { Card, CardHeader } from "@/components/ui/Card";
import { AlertIcon, InsightsIcon, ArrowUpIcon, ArrowDownIcon } from "@/components/ui/Icons";

interface InsightsPanelProps {
  alerts: SpendingAlert[];
  forecast: ForecastResult | null;
  currency: string;
}

export function InsightsPanel({ alerts, forecast, currency }: InsightsPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Card>
        <CardHeader
          title="Spending alerts"
          subtitle="Categories that moved significantly vs. their average"
          icon={<AlertIcon className="h-4 w-4" />}
        />
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] py-10 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              No significant changes detected yet.
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              This needs at least 3 months of transaction history to compare against —
              keep uploading statements.
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {alerts.map((alert) => (
              <li
                key={alert.categoryName}
                className={`flex items-center justify-between gap-4 rounded-[var(--radius-md)] border px-4 py-3.5 transition-transform hover:scale-[1.01] ${
                  alert.direction === "increase"
                    ? "border-[var(--negative)]/15 bg-[var(--negative-soft)]"
                    : "border-[var(--positive)]/15 bg-[var(--positive-soft)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      alert.direction === "increase"
                        ? "bg-[var(--negative)]/15 text-[var(--negative)]"
                        : "bg-[var(--positive)]/15 text-[var(--positive)]"
                    }`}
                  >
                    {alert.direction === "increase" ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {alert.categoryName}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {currency} {alert.currentMonthTotal.toFixed(0)} vs avg {currency}{" "}
                      {alert.averagePastMonths.toFixed(0)}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 text-sm font-semibold ${
                    alert.direction === "increase"
                      ? "text-[var(--negative)]"
                      : "text-[var(--positive)]"
                  }`}
                >
                  {alert.percentChange > 0 ? "+" : ""}
                  {alert.percentChange.toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="overflow-hidden bg-gradient-to-br from-[var(--navy-900)] via-[var(--navy-800)] to-[var(--navy-700)] text-white">
  <CardHeader
    title="Next month forecast"
    inverse
    icon={<InsightsIcon className="h-4 w-4" />}
  />

  {forecast ? (
    <div className="space-y-6">

      <div>
        <p className="text-3xl font-bold tracking-tight">
          {currency}{" "}
          {forecast.forecastedAmount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </p>

        <p className="mt-1 text-sm text-slate-300">
          Estimated spending next month
        </p>
      </div>

      {/* Confidence */}

      <div>
        <div className="mb-2 flex justify-between text-xs text-slate-300">
          <span>Forecast confidence</span>
          <span>{forecast.basedOnMonths} months analysed</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-700"
            style={{
              width: `${Math.min(
                forecast.basedOnMonths * 33,
                100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Method */}

      <div className="rounded-[var(--radius-md)] bg-white/5 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          Prediction Method
        </p>

        <p className="mt-2 text-sm text-slate-200">
          {forecast.method}
        </p>
      </div>

      {/* AI Insight */}

      <div className="rounded-[var(--radius-md)] border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          AI Insight
        </p>

        <p className="mt-2 text-sm leading-relaxed text-slate-200">
          This forecast is based on your previous spending behaviour.
          Upload additional monthly statements to improve prediction
          accuracy and allow the assistant to detect long-term spending
          trends.
        </p>
      </div>

    </div>
  ) : (
    <div className="flex h-full flex-col items-center justify-center py-12 text-center">

      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
        <InsightsIcon className="h-6 w-6 text-[var(--accent)]" />
      </div>

      <p className="text-lg font-semibold">
        Not enough history
      </p>

      <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-300">
        Upload at least three months of transaction history to unlock
        AI-powered spending forecasts and trend analysis.
      </p>

    </div>
  )}
</Card>
    </div>
  );
}