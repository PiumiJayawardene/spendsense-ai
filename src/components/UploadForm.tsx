"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UploadIcon } from "@/components/ui/Icons";
import { Badge } from "@/components/ui/Badge";

interface UploadResult {
  success: boolean;
  transactionsInserted: number;
  categorizedByRule: number;
  categorizedByAi: number;
  uncategorized: number;
  warnings: string[];
}

export function UploadForm() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function uploadFile(file: File) {
    setIsUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/transactions/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }

      setResult(data);
      router.refresh();
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setIsUploading(false);
    }
  }

  async function clearTransactions() {
    const confirmed = window.confirm(
      "Delete all currently loaded transactions?"
    );

    if (!confirmed) return;

    setIsClearing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/transactions/clear", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to clear transactions.");
        return;
      }

      router.refresh();
    } catch {
      setError("Failed to clear transactions.");
    } finally {
      setIsClearing(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      uploadFile(file);
    }
  }

  function handleFileSelect(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (file) {
      uploadFile(file);
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group cursor-pointer rounded-[var(--radius-lg)] border-2 border-dashed p-10 text-center transition-all duration-200 ${
          isDragging
            ? "scale-[1.01] border-[var(--accent)] bg-[var(--accent-soft)]"
            : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/50 hover:bg-[var(--bg-surface-sunken)]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div
          className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
            isDragging
              ? "bg-[var(--accent)] text-[var(--accent-on)]"
              : "bg-[var(--bg-surface-sunken)] text-[var(--text-tertiary)] group-hover:text-[var(--accent)]"
          }`}
        >
          <UploadIcon className="h-5 w-5" />
        </div>

        {isUploading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-secondary)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
            Uploading and categorizing…
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Drop a bank statement here, or click to browse
            </p>

            <p className="mt-1 text-xs text-[var(--text-tertiary)]">
              CSV or PDF, up to 10MB
            </p>
          </>
        )}
      </div>
            <div className="flex gap-3">
        <button
          type="button"
          onClick={clearTransactions}
          disabled={isClearing}
          className="rounded-[var(--radius-sm)] bg-[var(--negative)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {isClearing
            ? "Clearing..."
            : "Clear Current Statement"}
        </button>
      </div>

      {error && (
        <div className="animate-fade-in rounded-[var(--radius-sm)] border border-[var(--negative)]/20 bg-[var(--negative-soft)] px-4 py-3 text-sm text-[var(--negative)]">
          {error}
        </div>
      )}

      {result && (
        <div className="animate-fade-in rounded-[var(--radius-md)] border border-[var(--positive)]/20 bg-[var(--positive-soft)] px-4 py-3 text-sm">
          <p className="font-medium text-[var(--positive)]">
            ✓ Imported {result.transactionsInserted} transaction
            {result.transactionsInserted === 1 ? "" : "s"}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="default">
              {result.categorizedByRule} by rules
            </Badge>

            <Badge variant="accent">
              {result.categorizedByAi} by AI
            </Badge>

            {result.uncategorized > 0 && (
              <Badge variant="warning">
                {result.uncategorized} need review
              </Badge>
            )}
          </div>

          {result.warnings.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-xs text-[var(--text-secondary)]">
              {result.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}