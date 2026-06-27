export interface ParsedTransaction {
  description: string;
  amount: number;
  transactionDate: string;
  rawRow: Record<string, unknown>;
}

export interface ParseResult {
  transactions: ParsedTransaction[];
  warnings: string[];
  totalRowsSeen: number;
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}