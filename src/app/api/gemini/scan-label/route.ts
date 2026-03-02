import { createClient } from "@/lib/supabase/server";
import { geminiModel, NUTRITION_EXTRACTION_PROMPT, parseJsonResponse } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;
    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/jpeg";

    const result = await geminiModel.generateContent([
      NUTRITION_EXTRACTION_PROMPT,
      {
        inlineData: { data: base64, mimeType },
      },
    ]);

    const text = result.response.text();
    const nutrition = parseJsonResponse(text);

    return NextResponse.json({ nutrition });
  } catch (error) {
    console.error("Scan label error:", error);
    return NextResponse.json(
      { error: "Failed to extract nutrition data" },
      { status: 500 }
    );
  }
}
