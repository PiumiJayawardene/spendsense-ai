"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { CategoryBreakdown } from "@/lib/analytics/spending";

interface TooltipPayloadItem {
  payload: CategoryBreakdown;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface-raised)] px-3 py-2 text-xs shadow-[var(--shadow-md)]">
      <p className="font-medium text-[var(--text-primary)]">{item.categoryName}</p>
      <p className="text-[var(--text-secondary)]">
        {item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export function SpendingPieChart({ data }: { data: CategoryBreakdown[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm text-[var(--text-tertiary)]">
          No spending data yet — upload a statement to see your breakdown.
        </p>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="categoryName"
            cx="50%"
            cy="50%"
            innerRadius={62}
            outerRadius={92}
            paddingAngle={2}
            cornerRadius={6}
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {data.slice(0, 6).map((entry) => (
          <div key={entry.categoryName} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="truncate text-[var(--text-secondary)]">
              {entry.categoryName}
            </span>
            <span className="ml-auto shrink-0 font-medium text-[var(--text-primary)]">
              {total > 0 ? Math.round((entry.total / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}