import { createClient } from "@/lib/supabase/server";
import { geminiModel, PARSE_MEAL_PROMPT, parseJsonResponse } from "@/lib/gemini";
import { NextResponse } from "next/server";

// Extract the numeric grams/ml/etc from a serving size string like "60g" or "1 cup (240ml)"
function extractServingAmount(servingSize: string | null): { amount: number; unit: string } | null {
  if (!servingSize) return null;
  const match = servingSize.match(/(\d+\.?\d*)\s*(g|ml|oz)\b/i);
  if (match) return { amount: parseFloat(match[1]), unit: match[2].toLowerCase() };
  return null;
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

    // Step 1: Parse the meal text with Gemini
    const result = await geminiModel.generateContent(PARSE_MEAL_PROMPT + text);
    const parsed = parseJsonResponse(result.response.text()) as Array<{
      name: string;
      quantity: number;
      unit: string;
      servings: number;
    }>;

    // Step 2: Fuzzy match against user's food DB
    const items = await Promise.all(
      parsed.map(async (item) => {
        const { data: matches } = await supabase
          .from("foods")
          .select("*")
          .ilike("name", `%${item.name}%`)
          .eq("user_id", user.id)
          .limit(1);

        const matched = matches?.[0] || null;

        if (matched) {
          // Step 3a: Matched - calculate servings from quantity vs serving size
          let servings = item.servings || 1;
          const serving = extractServingAmount(matched.serving_size);
          const userUnit = item.unit?.toLowerCase();

          if (serving && item.quantity && userUnit === serving.unit) {
            servings = Math.round((item.quantity / serving.amount) * 100) / 100;
          }

          return { ...item, servings, matched_food: matched };
        }

        // Step 3b: No match - ask Gemini to estimate nutrition and auto-create food
        try {
          const lookupResult = await geminiModel.generateContent(
            `Estimate the nutrition facts for: ${item.quantity} ${item.unit} of ${item.name}.
Return ONLY valid JSON:
{
  "name": "${item.name}",
  "serving_size": "${item.quantity}${item.unit}",
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "fiber_g": number,
  "sugar_g": number,
  "sodium_mg": number
}`
          );
          const estimated = parseJsonResponse(lookupResult.response.text()) as {
            name: string;
            serving_size: string;
            calories: number;
            protein_g: number;
            carbs_g: number;
            fat_g: number;
            fiber_g: number;
            sugar_g: number;
            sodium_mg: number;
          };

          // Auto-create food record in DB
          const { data: newFood } = await supabase
            .from("foods")
            .insert({
              user_id: user.id,
              name: estimated.name || item.name,
              serving_size: estimated.serving_size || `${item.quantity}${item.unit}`,
              calories: estimated.calories || 0,
              protein_g: estimated.protein_g || 0,
              carbs_g: estimated.carbs_g || 0,
              fat_g: estimated.fat_g || 0,
              fiber_g: estimated.fiber_g || 0,
              sugar_g: estimated.sugar_g || 0,
              sodium_mg: estimated.sodium_mg || 0,
              source: "lookup",
            })
            .select()
            .single();

          return {
            ...item,
            servings: 1,
            matched_food: newFood,
          };
        } catch {
          // If lookup fails, return item without nutrition
          return { ...item, matched_food: null };
        }
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
