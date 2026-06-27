import type { ReactNode } from "react";

type BadgeVariant = "default" | "positive" | "negative" | "warning" | "info" | "accent";

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "bg-[var(--bg-surface-sunken)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
  positive: "bg-[var(--positive-soft)] text-[var(--positive)] border-transparent",
  negative: "bg-[var(--negative-soft)] text-[var(--negative)] border-transparent",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)] border-transparent",
  info: "bg-[var(--info-soft)] text-[var(--info)] border-transparent",
  accent: "bg-[var(--accent-soft)] text-[var(--accent-strong)] border-transparent",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}