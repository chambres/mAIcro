import { createClient } from "@/lib/supabase/server";
import { geminiModel, FOOD_LOOKUP_PROMPT, parseJsonResponse } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "No food name provided" }, { status: 400 });
    }

    const result = await geminiModel.generateContent(FOOD_LOOKUP_PROMPT + name);
    const nutrition = parseJsonResponse(result.response.text());

    return NextResponse.json({ nutrition });
  } catch (error) {
    console.error("Lookup food error:", error);
    return NextResponse.json(
      { error: "Failed to look up food" },
      { status: 500 }
    );
  }
}
