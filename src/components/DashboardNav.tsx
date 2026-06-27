"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/supabase/actions";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  DashboardIcon,
  BudgetIcon,
  InsightsIcon,
  ChatIcon,
  LogoutIcon,
} from "@/components/ui/Icons";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/dashboard/budgets", label: "Budgets", icon: BudgetIcon },
  { href: "/dashboard/insights", label: "Insights", icon: InsightsIcon },
  { href: "/dashboard/chat", label: "Chat", icon: ChatIcon },
];

export function DashboardNav({ displayName }: { displayName: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[var(--navy-950)] shadow-[var(--shadow-md)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] text-sm font-bold text-[var(--accent-on)]">
            ₣
          </span>
          <span className="hidden text-sm font-semibold text-white sm:inline">
            SpendSense AI
          </span>
        </Link>

        <nav className="flex items-center gap-1 rounded-full bg-white/5 p-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <NavLink key={item.href} href={item.href} isActive={isActive}>
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="hidden max-w-[140px] truncate text-xs text-slate-400 md:inline">
            {displayName}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Log out"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogoutIcon className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
        isActive
          ? "bg-[var(--accent)] text-[var(--accent-on)] shadow-[var(--shadow-sm)]"
          : "text-slate-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}