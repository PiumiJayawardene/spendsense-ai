import PDFParser from "pdf2json";
import type { ParsedTransaction, ParseResult } from "./types";
import { ParseError } from "./types";

function parseDate(raw: string): string | null {
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

  const match = raw.match(
    /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/
  );

  if (!match) return null;

  const [, day, month, year] = match;

  return `${year}-${monthMap[month]}-${day.padStart(
    2,
    "0"
  )}`;
}

export async function parseCommercialBankStatement(
  buffer: Buffer
): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (err) => {
      reject(
        new ParseError(
          typeof err === "object"
            ? JSON.stringify(err)
            : String(err)
        )
      );
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      try {
        const transactions: ParsedTransaction[] = [];

        for (const page of pdfData.Pages) {
          const rows = new Map<
            number,
            { text: string; x: number }[]
          >();

          for (const text of page.Texts) {
            const decoded = decodeURIComponent(
              text.R?.[0]?.T ?? ""
            );

            const y = Math.round(text.y * 100) / 100;

            if (!rows.has(y)) {
              rows.set(y, []);
            }

            rows.get(y)!.push({
              text: decoded,
              x: text.x,
            });
          }

          const sortedRows = [...rows.entries()].sort(
            (a, b) => a[0] - b[0]
          );

          for (const [, parts] of sortedRows) {
            const sortedParts = [...parts].sort(
              (a, b) => a.x - b.x
            );

            const rowText = sortedParts
              .map((p) => p.text)
              .join("")
              .replace(/\s+/g, " ")
              .trim();

            const dateMatch = rowText.match(
              /^(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})/
            );

            if (!dateMatch) continue;

            const transactionDate = parseDate(
              dateMatch[1]
            );

            if (!transactionDate) continue;

            let description = "";
            let receiptAmount = "";
            let paymentAmount = "";

            for (const part of sortedParts) {
              const x = part.x;
              const text = part.text;

             
              if (x >= 11 && x < 23) {
                description += text;
              }

             
              if (x >= 23 && x < 26) {
                receiptAmount += text;
              }

              
              if (x >= 26) {
                paymentAmount += text;
              }
            }

            description = description
  .replace(/\s+/g, " ")

  
  .replace(/PUR C HASE/gi, "PURCHASE")
.replace(/PI C KME/gi, "PICKME")
.replace(/PL C\b/gi, "PLC")
.replace(/ C RM/gi, "CRM")
.replace(/ C hg/gi, "Chg")
.replace(/ANTHROPI C/gi, "ANTHROPIC")
.replace(/ C LAUDE/gi, "CLAUDE")
.replace(/TI G/gi, "TIG")

  .trim();

            let amount = 0;

            if (paymentAmount.trim()) {
              amount = -parseFloat(
                paymentAmount.replace(/,/g, "")
              );
            } else if (receiptAmount.trim()) {
              amount = parseFloat(
                receiptAmount.replace(/,/g, "")
              );
            } else {
              continue;
            }

            if (
              !description ||
              Number.isNaN(amount)
            ) {
              continue;
            }

            transactions.push({
              description,
              amount,
              transactionDate,
              rawRow: {
                rowText,
              },
            });
          }
        }

        resolve({
          transactions,
          warnings: [],
          totalRowsSeen: transactions.length,
        });
      } catch (err) {
        reject(err);
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}