export interface CategoryRule {
  category: string;
  keywords: string[];
}

export const CATEGORY_RULES: CategoryRule[] = [
  {
    category: "Income",
    keywords: ["salary", "payroll", "salary deposit", "interest credit", "dividend", "refund", "reimbursement"],
  },
  {
    category: "Transfers",
    keywords: ["transfer from", "transfer to", "fund transfer", "internal transfer", "p2p transfer"],
  },
  {
    category: "Groceries",
    keywords: ["keells", "cargills", "arpico", "spar", "supermarket", "food city", "grocery", "fresh market"],
  },
  {
    category: "Dining Out",
    keywords: ["restaurant", "cafe", "coffee", "kfc", "mcdonald", "pizzahut", "pizza hut", "dominos", "burger", "bakery", "uber eats", "pickme food", "foodpanda"],
  },
  {
    category: "Transport",
    keywords: ["uber", "pickme", "kangaroo cab", "taxi", "fuel", "petrol", "diesel", "filling station", "ceypetco", "ioc fuel", "parking", "railway", "bus fare"],
  },
  {
    category: "Utilities",
    keywords: ["ceb", "electricity", "water board", "nwsdb", "slt", "telecom", "dialog", "mobitel", "internet bill", "broadband", "gas bill", "litro"],
  },
  {
    category: "Rent/Mortgage",
    keywords: ["rent payment", "rent", "mortgage", "lease payment", "landlord"],
  },
  {
    category: "Healthcare",
    keywords: ["pharmacy", "hospital", "clinic", "doctor", "medical", "diagnostic", "lab test", "asiri", "nawaloka", "lanka hospital", "durdans"],
  },
  {
    category: "Entertainment",
    keywords: ["netflix", "spotify", "youtube premium", "cinema", "movie", "pvr", "scope cinemas", "concert", "game", "steam", "playstation"],
  },
  {
    category: "Shopping",
    keywords: ["daraz", "amazon", "kapruka", "odel", "fashion bug", "shopping mall", "clothing", "electronics store"],
  },
  {
    category: "Education",
    keywords: ["school fee", "tuition", "university", "course fee", "udemy", "coursera", "book store", "textbook"],
  },
  {
    category: "Subscriptions",
    keywords: ["subscription", "monthly plan", "icloud", "google one", "adobe", "microsoft 365", "chatgpt", "openai", "claude.ai", "membership fee"],
  },
  {
    category: "Travel",
    keywords: ["airlines", "airline", "flight", "booking.com", "airbnb", "hotel", "expedia", "agoda", "travel agency"],
  },
];

export function matchCategoryRule(description: string): string | null {
  const normalized = description.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    for (const keyword of rule.keywords) {
      if (normalized.includes(keyword)) {
        return rule.category;
      }
    }
  }

  return null;
}