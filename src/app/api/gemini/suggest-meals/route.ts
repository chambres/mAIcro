import { createClient } from "@/lib/supabase/server";
import { geminiModel, SUGGEST_MEALS_PROMPT, parseJsonResponse } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { remaining_macros } = await request.json();

    // Get user's food database
    const { data: foods } = await supabase
      .from("foods")
      .select("name, serving_size, calories, protein_g, carbs_g, fat_g")
      .eq("user_id", user.id)
      .limit(50);

    const foodList = foods?.length
      ? "User's available foods:\n" +
        foods
          .map(
            (f) =>
              `- ${f.name} (${f.serving_size}): ${f.calories}cal, ${f.protein_g}p, ${f.carbs_g}c, ${f.fat_g}f`
          )
          .join("\n")
      : "User has no saved foods yet. Suggest common healthy foods.";

    const prompt =
      SUGGEST_MEALS_PROMPT +
      `Remaining macros for today:\n` +
      `- Calories: ${remaining_macros.calories}\n` +
      `- Protein: ${remaining_macros.protein_g}g\n` +
      `- Carbs: ${remaining_macros.carbs_g}g\n` +
      `- Fat: ${remaining_macros.fat_g}g\n\n` +
      foodList;

    const result = await geminiModel.generateContent(prompt);
    const suggestions = parseJsonResponse(result.response.text());

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Suggest meals error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
