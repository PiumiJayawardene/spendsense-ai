import { matchCategoryRule } from "./rules";
import { categorizeWithAi } from "@/lib/ai/categorize";

export interface CategorizationResult {
  categoryId: string | null;
  categorizedBy: "rule" | "ai" | "user" | null;
  confidence: number | null;
}

export function buildCategoryNameMap(
  categories: { id: string; name: string }[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const cat of categories) {
    map.set(cat.name, cat.id);
  }
  return map;
}

export function categorizeByRule(
  description: string,
  categoryNameMap: Map<string, string>
): CategorizationResult {
  const matchedCategoryName = matchCategoryRule(description);

  if (!matchedCategoryName) {
    return { categoryId: null, categorizedBy: null, confidence: null };
  }

  const categoryId = categoryNameMap.get(matchedCategoryName);
  if (!categoryId) {
    return { categoryId: null, categorizedBy: null, confidence: null };
  }

  return { categoryId, categorizedBy: "rule", confidence: 1.0 };
}


export async function categorizeWithFallback(
  description: string,
  amount: number,
  categoryNameMap: Map<string, string>
): Promise<CategorizationResult> {
  const ruleResult = categorizeByRule(description, categoryNameMap);
  if (ruleResult.categoryId) {
    return ruleResult;
  }

  const aiResult = await categorizeWithAi(description, amount);
  const categoryId = categoryNameMap.get(aiResult.category);

  if (!categoryId) {
    return { categoryId: null, categorizedBy: null, confidence: null };
  }

  return { categoryId, categorizedBy: "ai", confidence: aiResult.confidence };
}

export function categorizeBatch(
  descriptions: string[],
  categoryNameMap: Map<string, string>
): CategorizationResult[] {
  return descriptions.map((desc) => categorizeByRule(desc, categoryNameMap));
}


export async function categorizeBatchWithFallback(
  transactions: { description: string; amount: number }[],
  categoryNameMap: Map<string, string>
): Promise<CategorizationResult[]> {
  const results: CategorizationResult[] = [];

  for (const txn of transactions) {
    const result = await categorizeWithFallback(txn.description, txn.amount, categoryNameMap);
    results.push(result);
  }

  return results;
}