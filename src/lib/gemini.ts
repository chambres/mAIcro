import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

export const NUTRITION_EXTRACTION_PROMPT = `Analyze this nutrition label image and extract the nutrition facts.
Return ONLY valid JSON with this exact structure (use null for values you can't read):
{
  "name": "product name if visible",
  "brand": "brand name if visible",
  "serving_size": "serving size with unit",
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "fiber_g": number,
  "sugar_g": number,
  "saturated_fat_g": number or null,
  "trans_fat_g": number or null,
  "cholesterol_mg": number or null,
  "sodium_mg": number or null,
  "potassium_mg": number or null,
  "vitamin_a_pct": number or null,
  "vitamin_c_pct": number or null,
  "vitamin_d_pct": number or null,
  "calcium_pct": number or null,
  "iron_pct": number or null
}`;

export const FOOD_LOOKUP_PROMPT = `You are a nutrition database. Given the food item below, estimate its nutrition facts per standard serving based on USDA data.
Return ONLY valid JSON:
{
  "name": "food name",
  "serving_size": "standard serving size",
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "fiber_g": number,
  "sugar_g": number,
  "sodium_mg": number
}

Food item: `;

export const PARSE_MEAL_PROMPT = `Parse the following natural language meal description into individual food items.
Return ONLY valid JSON array:
[
  {
    "name": "food item name (lowercase, simple)",
    "quantity": number,
    "unit": "unit of measurement",
    "servings": number
  }
]

Examples:
- "2 eggs and toast with butter" -> [{"name":"egg","quantity":2,"unit":"piece","servings":2},{"name":"toast","quantity":1,"unit":"slice","servings":1},{"name":"butter","quantity":1,"unit":"tbsp","servings":1}]
- "a bowl of oatmeal with banana" -> [{"name":"oatmeal","quantity":1,"unit":"bowl","servings":1},{"name":"banana","quantity":1,"unit":"medium","servings":1}]

Meal description: `;

export const SUGGEST_MEALS_PROMPT = `You are a meal planning assistant. Given the user's remaining macros for the day and their available foods, suggest 3 meals they could eat.

Each meal should try to fit within the remaining macros. Use the user's actual food database when possible.

Return ONLY valid JSON:
[
  {
    "name": "Meal name",
    "description": "Brief description",
    "items": [
      {
        "food_name": "food item",
        "servings": number,
        "calories": number,
        "protein_g": number,
        "carbs_g": number,
        "fat_g": number
      }
    ],
    "total_calories": number,
    "total_protein_g": number,
    "total_carbs_g": number,
    "total_fat_g": number
  }
]

`;

export function parseJsonResponse(text: string): unknown {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
}
