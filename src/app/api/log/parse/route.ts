import { createClient } from "@/lib/supabase/server";
import { geminiModel, PARSE_MEAL_PROMPT, parseJsonResponse } from "@/lib/gemini";
import { NextResponse } from "next/server";

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

        return {
          ...item,
          matched_food: matches?.[0] || null,
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
