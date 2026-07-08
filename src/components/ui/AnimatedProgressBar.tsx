"use client";

import { useEffect, useState } from "react";

export function AnimatedProgressBar({
  percent,
  isOver,
}: {
  percent: number;
  isOver: boolean;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    
    const id = requestAnimationFrame(() => setWidth(percent));
    return () => cancelAnimationFrame(id);
  }, [percent]);

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-surface-sunken)]">
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${
          isOver ? "bg-[var(--negative)]" : "bg-[var(--accent)]"
        }`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}