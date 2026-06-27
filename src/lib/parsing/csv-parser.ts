import Papa from "papaparse";
import type { ParsedTransaction, ParseResult } from "./types";
import { ParseError } from "./types";

const DATE_COLUMNS = [
  "date",
  "transaction date",
  "posting date",
  "value date",
  "txn date",
];

const DESCRIPTION_COLUMNS = [
  "description",
  "narration",
  "particulars",
  "details",
  "memo",
  "merchant",
  "transaction details",
];

const AMOUNT_COLUMNS = ["amount", "transaction amount", "value"];
const DEBIT_COLUMNS = ["debit", "withdrawal", "debit amount", "money out"];
const CREDIT_COLUMNS = ["credit", "deposit", "credit amount", "money in"];

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, " ");
}

function findColumn(headers: string[], candidates: string[]): string | null {
  const normalizedHeaders = headers.map(normalizeHeader);
  for (const candidate of candidates) {
    const idx = normalizedHeaders.indexOf(candidate);
    if (idx !== -1) return headers[idx];
  }
  return null;
}

function parseDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const slashMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (slashMatch) {
    const [, a, b, year] = slashMatch;
    const aNum = parseInt(a, 10);
    const bNum = parseInt(b, 10);
    let day: number, month: number;
    if (aNum > 12) {
      day = aNum;
      month = bNum;
    } else if (bNum > 12) {
      day = bNum;
      month = aNum;
    } else {
      day = aNum;
      month = bNum;
    }
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return null;
}

function parseAmount(raw: string): number | null {
  if (!raw) return null;
  let str = raw.trim();
  if (!str) return null;

  const isParenNegative = /^\(.*\)$/.test(str);
  if (isParenNegative) str = str.slice(1, -1);

  str = str.replace(/[A-Za-z]{0,3}\s?(LKR|USD|Rs\.?|\$|€|£)?/gi, "");
  str = str.replace(/,/g, "").trim();

  const num = parseFloat(str);
  if (isNaN(num)) return null;

  return isParenNegative ? -Math.abs(num) : num;
}

export function parseCsvStatement(csvText: string): ParseResult {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    throw new ParseError(
      `CSV could not be parsed: ${parsed.errors[0].message}`
    );
  }

  const headers = parsed.meta.fields ?? [];
  if (headers.length === 0) {
    throw new ParseError("CSV has no header row.");
  }

  const dateCol = findColumn(headers, DATE_COLUMNS);
  const descCol = findColumn(headers, DESCRIPTION_COLUMNS);
  const amountCol = findColumn(headers, AMOUNT_COLUMNS);
  const debitCol = findColumn(headers, DEBIT_COLUMNS);
  const creditCol = findColumn(headers, CREDIT_COLUMNS);

  if (!dateCol) {
    throw new ParseError(
      `Could not find a date column. Headers found: ${headers.join(", ")}`
    );
  }
  if (!descCol) {
    throw new ParseError(
      `Could not find a description column. Headers found: ${headers.join(", ")}`
    );
  }
  if (!amountCol && !(debitCol || creditCol)) {
    throw new ParseError(
      `Could not find an amount, debit, or credit column. Headers found: ${headers.join(", ")}`
    );
  }

  const transactions: ParsedTransaction[] = [];
  const warnings: string[] = [];
  let skippedDate = 0;
  let skippedAmount = 0;

  for (const row of parsed.data) {
    const isoDate = parseDate(row[dateCol] ?? "");
    if (!isoDate) {
      skippedDate++;
      continue;
    }

    let amount: number | null = null;
    if (amountCol) {
      amount = parseAmount(row[amountCol] ?? "");
    } else {
      const debit = debitCol ? parseAmount(row[debitCol] ?? "") : null;
      const credit = creditCol ? parseAmount(row[creditCol] ?? "") : null;
      if (debit !== null && debit !== 0) amount = -Math.abs(debit);
      else if (credit !== null && credit !== 0) amount = Math.abs(credit);
    }

    if (amount === null) {
      skippedAmount++;
      continue;
    }

    transactions.push({
      description: (row[descCol] ?? "").trim() || "(no description)",
      amount,
      transactionDate: isoDate,
      rawRow: row,
    });
  }

  if (skippedDate > 0) {
    warnings.push(`${skippedDate} row(s) skipped: unparseable date`);
  }
  if (skippedAmount > 0) {
    warnings.push(`${skippedAmount} row(s) skipped: unparseable amount`);
  }

  return {
    transactions,
    warnings,
    totalRowsSeen: parsed.data.length,
  };
}