"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface CategoryOption {
  id: string;
  name: string;
  icon: string | null;
}

export function BudgetForm({ categories }: { categories: CategoryOption[] }) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [limitAmount, setLimitAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const now = new Date();
    const periodMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          limitAmount: parseFloat(limitAmount),
          periodMonth,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save budget.");
        return;
      }

      setLimitAmount("");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[160px]">
        <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
          Category
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
          Monthly limit
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          required
          value={limitAmount}
          onChange={(e) => setLimitAmount(e.target.value)}
          placeholder="0.00"
          className="w-36 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
        />
      </div>
      <Button type="submit" isLoading={isSaving}>
        {isSaving ? "Saving" : "Set budget"}
      </Button>
      {error && <p className="text-sm text-[var(--negative)]">{error}</p>}
    </form>
  );
}