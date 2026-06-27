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
    // Defer to next frame so the transition actually animates from 0
    // instead of snapping straight to the target value on mount.
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