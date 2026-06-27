import pdf from "pdf-parse";
import type { ParsedTransaction, ParseResult } from "./types";
import { ParseError } from "./types";



const LINE_DATE_RE =
  /^(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})(.*)$/;
const TRAILING_AMOUNT_RE =
  /^(.*\S)\s+([(]?-?(?:LKR|USD|Rs\.?|\$)?\s?-?[\d,]+\.\d{2}[)]?)\s*$/i;

function parsePdfDate(raw: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const monthMap: Record<string, string> = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  const monthMatch = raw.match(
    /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/
  );

  if (monthMatch) {
    const [, day, month, year] = monthMatch;

    return `${year}-${monthMap[month]}-${day.padStart(2, "0")}`;
  }

  const m = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

  if (!m) return null;

  const [, day, month, year] = m;

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parsePdfAmount(raw: string): number | null {
  let str = raw.trim();
  const isParenNegative = /^\(.*\)$/.test(str);
  if (isParenNegative) str = str.slice(1, -1);

  const hasLeadingMinus = /^-/.test(str);
  str = str.replace(/^-/, "");
  str = str.replace(/(LKR|USD|Rs\.?|\$)/gi, "").replace(/,/g, "").trim();

  const num = parseFloat(str);
  if (isNaN(num)) return null;

  return isParenNegative || hasLeadingMinus ? -Math.abs(num) : num;
}

export async function parsePdfStatement(buffer: Buffer): Promise<ParseResult> {
  let rawText: string;

  try {
  const result = await pdf(buffer);
rawText = result.text
} catch (err) {
  throw new ParseError(
    `Could not read PDF: ${err instanceof Error ? err.message : "unknown error"}`
  );
}

  if (!rawText || rawText.trim().length === 0) {
    throw new ParseError(
      "No extractable text found in this PDF. It may be a scanned image rather than a text-based statement."
    );
  }

  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const transactions: ParsedTransaction[] = [];
  const warnings: string[] = [];
  let skippedNoDate = 0;
  let skippedNoAmount = 0;

  for (const line of lines) {
    const dateMatch = line.match(LINE_DATE_RE);
    if (!dateMatch) continue;

    const isoDate = parsePdfDate(dateMatch[1]);
    if (!isoDate) {
      skippedNoDate++;
      continue;
    }

    const remainder = dateMatch[2].trim();
    const amountMatch = remainder.match(/([\d,]+\.\d{2})$/);

if (!amountMatch) {
  skippedNoAmount++;
  continue;
}

const amountText = amountMatch[1];

const description = remainder
  .slice(0, remainder.length - amountText.length)
  .trim();

const amount = parsePdfAmount(amountText);
    if (amount === null) {
      skippedNoAmount++;
      continue;
    }
    let finalAmount = amount;

const expenseKeywords = [
  "PURCHASE",
  "WITHDRAWAL",
  "UBER",
  "PICKME",
  "DIALOG",
  "NETFLIX",
  "ANTHROPIC",
  "KAS-",
];

if (
  expenseKeywords.some((keyword) =>
    description.toUpperCase().includes(keyword)
  )
) {
  finalAmount = -Math.abs(amount);
}

    transactions.push({
  description: description || "(no description)",
  amount: finalAmount,
  transactionDate: isoDate,
  rawRow: { sourceLine: line },
});
  }

  if (skippedNoDate > 0) {
    warnings.push(`${skippedNoDate} line(s) had a date-like prefix but couldn't be parsed`);
  }
  if (skippedNoAmount > 0) {
    warnings.push(`${skippedNoAmount} line(s) had a date but no trailing amount found`);
  }
  
  if (transactions.length === 0) {
    warnings.push(
      "No transaction lines matched the expected pattern. CSV upload is more reliable for this file."
    );
  }

  return {
    transactions,
    warnings,
    totalRowsSeen: lines.length,
  };
}