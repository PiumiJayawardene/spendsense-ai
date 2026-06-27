export interface TransactionForInsights {
  amount: number;
  transaction_date: string;
  category_id: string | null;
  categories: { name: string } | null;
}

export interface SpendingAlert {
  categoryName: string;
  currentMonthTotal: number;
  averagePastMonths: number;
  percentChange: number;
  direction: "increase" | "decrease";
}

export interface ForecastResult {
  forecastedAmount: number;
  basedOnMonths: number;
  method: string;
  lastMonthAmount: number;
  changePercentage: number;
}


function buildMonthCategoryTotals(
  transactions: TransactionForInsights[]
): Map<string, Map<string, number>> {
  const result = new Map<string, Map<string, number>>();

  for (const txn of transactions) {
    if (txn.amount >= 0) continue;

    const month = txn.transaction_date.slice(0, 7);
    const category = txn.categories?.name ?? "Uncategorized";

    if (!result.has(month)) result.set(month, new Map());

    const categoryMap = result.get(month)!;

    categoryMap.set(
      category,
      (categoryMap.get(category) ?? 0) + Math.abs(txn.amount)
    );
  }

  return result;
}


export function detectSpendingAlerts(
  transactions: TransactionForInsights[],
  thresholdPercent = 25
): SpendingAlert[] {
  const monthCategoryTotals =
    buildMonthCategoryTotals(transactions);

  const months = Array.from(
    monthCategoryTotals.keys()
  ).sort();

  if (months.length < 3) {
    return [];
  }

  const currentMonth = months[months.length - 1];
  const priorMonths = months.slice(0, -1);

  const currentTotals =
    monthCategoryTotals.get(currentMonth)!;

  const alerts: SpendingAlert[] = [];

  const allCategories = new Set<string>();

  for (const monthMap of monthCategoryTotals.values()) {
    for (const cat of monthMap.keys()) {
      allCategories.add(cat);
    }
  }

  for (const category of allCategories) {
    const currentTotal =
      currentTotals.get(category) ?? 0;

    const priorTotals = priorMonths.map(
      (m) =>
        monthCategoryTotals.get(m)!.get(category) ?? 0
    );

    const averagePast =
      priorTotals.reduce((sum, v) => sum + v, 0) /
      priorTotals.length;

    if (averagePast === 0 && currentTotal === 0)
      continue;

    if (averagePast === 0) continue;

    const percentChange =
      ((currentTotal - averagePast) / averagePast) *
      100;

    if (
      Math.abs(percentChange) >= thresholdPercent
    ) {
      alerts.push({
        categoryName: category,
        currentMonthTotal: currentTotal,
        averagePastMonths: averagePast,
        percentChange,
        direction:
          percentChange > 0
            ? "increase"
            : "decrease",
      });
    }
  }

  return alerts.sort(
    (a, b) =>
      Math.abs(b.percentChange) -
      Math.abs(a.percentChange)
  );
}


export function forecastNextMonth(
  transactions: TransactionForInsights[],
  windowSize = 3
): ForecastResult | null {
  const monthCategoryTotals =
    buildMonthCategoryTotals(transactions);

  const months = Array.from(
    monthCategoryTotals.keys()
  ).sort();

  if (months.length === 0) return null;

  const monthlyExpenseTotals = months.map(
    (month) => {
      const categoryMap =
        monthCategoryTotals.get(month)!;

      return Array.from(
        categoryMap.values()
      ).reduce((sum, v) => sum + v, 0);
    }
  );

  const windowMonths =
    monthlyExpenseTotals.slice(-windowSize);

  const forecastedAmount =
    windowMonths.reduce(
      (sum, v) => sum + v,
      0
    ) / windowMonths.length;

 const lastMonthAmount =
  monthlyExpenseTotals[monthlyExpenseTotals.length - 1];

const changePercentage =
  lastMonthAmount === 0
    ? 0
    : ((forecastedAmount - lastMonthAmount) /
        lastMonthAmount) *
      100;

return {
  forecastedAmount,
  basedOnMonths: windowMonths.length,
  method: `${windowMonths.length}-month moving average`,
  lastMonthAmount,
  changePercentage,
};
}
