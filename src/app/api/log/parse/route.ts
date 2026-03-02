import { createClient } from "@/lib/supabase/server";
import { geminiModel, PARSE_MEAL_PROMPT, parseJsonResponse } from "@/lib/gemini";
import { NextResponse } from "next/server";

// Extract numeric value from a serving size string, converting to match the user's unit
function parseServingSize(servingSize: string | null, userUnit: string): number {
  if (!servingSize) return 0;

  // Normalize units
  const unitMap: Record<string, string[]> = {
    g: ["g", "gram", "grams"],
    ml: ["ml", "milliliter", "milliliters", "millilitres"],
    oz: ["oz", "ounce", "ounces"],
    cup: ["cup", "cups"],
    tbsp: ["tbsp", "tablespoon", "tablespoons"],
    tsp: ["tsp", "teaspoon", "teaspoons"],
    piece: ["piece", "pieces", "pcs", "pc", "count", "serving", "servings"],
  };

  const normalizeUnit = (u: string): string => {
    const lower = u.toLowerCase().trim();
    for (const [key, aliases] of Object.entries(unitMap)) {
      if (aliases.includes(lower)) return key;
    }
    return lower;
  };

  const normalizedUserUnit = normalizeUnit(userUnit);

  // Extract number and unit from serving size string (e.g., "60g", "1 cup", "2 tbsp (30g)")
  // First try to find a match with the user's unit
  const patterns = [
    /(\d+\.?\d*)\s*(g|ml|oz|cup|cups|tbsp|tsp|piece|pieces|serving|servings)\b/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(servingSize)) !== null) {
      const num = parseFloat(match[1]);
      const unit = normalizeUnit(match[2]);
      if (unit === normalizedUserUnit) return num;
    }
  }

  // Fallback: just extract the first number if units are the same category
  const firstNum = servingSize.match(/(\d+\.?\d*)/);
  if (firstNum) return parseFloat(firstNum[1]);

  return 0;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Parse the meal text with Gemini
    const result = await geminiModel.generateContent(PARSE_MEAL_PROMPT + text);
    const parsed = parseJsonResponse(result.response.text()) as Array<{
      name: string;
      quantity: number;
      unit: string;
      servings: number;
    }>;

    // Try fuzzy matching against user's food DB
    const items = await Promise.all(
      parsed.map(async (item) => {
        const { data: matches } = await supabase
          .from("foods")
          .select("*")
          .ilike("name", `%${item.name}%`)
          .eq("user_id", user.id)
          .limit(1);

        const matched = matches?.[0] || null;

        // Calculate servings based on user's quantity vs food's serving size
        let servings = item.servings || 1;
        if (matched && item.quantity && item.unit) {
          const servingNum = parseServingSize(matched.serving_size, item.unit);
          if (servingNum > 0) {
            servings = Math.round((item.quantity / servingNum) * 100) / 100;
          }
        }

        return {
          ...item,
          servings,
          matched_food: matched,
        };
      })
    );

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Parse meal error:", error);
    return NextResponse.json(
      { error: "Failed to parse meal" },
      { status: 500 }
    );
  }
}
