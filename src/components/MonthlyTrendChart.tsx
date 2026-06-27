"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyTotal } from "@/lib/analytics/spending";

interface TooltipPayloadItem {
  value: number;
  name: string;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface-raised)] px-3 py-2 text-xs shadow-[var(--shadow-md)]">
      <p className="mb-1 font-medium text-[var(--text-primary)]">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2" style={{ color: entry.color }}>
          <span>{entry.name}:</span>
          <span className="font-medium">
            {entry.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </p>
      ))}
    </div>
  );
}

export function MonthlyTrendChart({ data }: { data: MonthlyTotal[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[var(--text-tertiary)]">
        No transaction history yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={6}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
          axisLine={{ stroke: "var(--border-subtle)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--bg-surface-sunken)" }} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }}
          iconType="circle"
        />
        <Bar dataKey="income" fill="var(--positive)" name="Income" radius={[6, 6, 0, 0]} />
        <Bar dataKey="expenses" fill="var(--negative)" name="Expenses" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}