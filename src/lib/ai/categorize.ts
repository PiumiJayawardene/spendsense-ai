import { getChatCompletion } from "./client";

const VALID_CATEGORIES = [
  "Groceries", "Dining Out", "Transport", "Utilities", "Rent/Mortgage",
  "Healthcare", "Entertainment", "Shopping", "Education", "Subscriptions",
  "Travel", "Income", "Transfers", "Other",
];

interface AiCategorizationResult {
  category: string;
  confidence: number;
}


export async function categorizeWithAi(
  description: string,
  amount: number
): Promise<AiCategorizationResult> {
  const prompt = `You are a financial transaction categorizer. Given a bank transaction description and amount, pick the SINGLE most likely category from this exact list:

${VALID_CATEGORIES.join(", ")}

Transaction description: "${description}"
Amount: ${amount} (negative = money spent, positive = money received)

Respond ONLY with valid JSON in this exact format, with no other text:
{"category": "CategoryNameFromTheList", "confidence": 0.0-1.0}`;

  try {
    const response = await getChatCompletion({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      jsonMode: true,
    });

    const parsed = JSON.parse(response);

    if (typeof parsed.category === "string" && VALID_CATEGORIES.includes(parsed.category)) {
      return {
        category: parsed.category,
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
      };
    }

    return { category: "Other", confidence: 0.3 };
  } catch (err) {
    console.error("AI categorization failed:", err);
    return { category: "Other", confidence: 0.1 };
  }
}