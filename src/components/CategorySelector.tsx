"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Category {
  id: string;
  name: string;
}

interface Props {
  transactionId: string;
  categories: Category[];
  selectedCategoryId: string | null;
}

export function CategorySelector({
  transactionId,
  categories,
  selectedCategoryId,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(selectedCategoryId ?? "");

  async function handleChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    const categoryId = e.target.value;

    setValue(categoryId);
    setLoading(true);

    try {
      await fetch("/api/transactions/category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId,
          categoryId,
        }),
      });

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={value}
      disabled={loading}
      onChange={handleChange}
      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900"
    >
      <option value="">
        Select Category
      </option>

      {categories.map((cat) => (
        <option
          key={cat.id}
          value={cat.id}
        >
          {cat.name}
        </option>
      ))}
    </select>
  );
}