import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

export function Card({ children, className = "", padded = true }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)] transition-shadow duration-200 hover:shadow-[var(--shadow-md)] ${
        padded ? "p-5 sm:p-6" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
  inverse = false,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
  inverse?: boolean;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {icon && (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] ${
              inverse
                ? "bg-white/10 text-white"
                : "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
            }`}
          >
            {icon}
          </div>
        )}
        <div>
          <h2
            className={`text-sm font-semibold ${
              inverse ? "text-white" : "text-[var(--text-primary)]"
            }`}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={`mt-0.5 text-xs ${
                inverse ? "text-slate-300" : "text-[var(--text-tertiary)]"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}