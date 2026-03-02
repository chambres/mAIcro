"use client";

import { useState } from "react";
import MealInput from "@/components/MealInput";
import { useDailyLog } from "@/hooks/useDailyLog";
import { formatDate, getMealLabel } from "@/lib/utils";
import { ParsedFoodItem, Food } from "@/lib/types";

export default function LogPage() {
  const [step, setStep] = useState<"input" | "loading" | "confirm">("input");
  const [items, setItems] = useState<ParsedFoodItem[]>([]);
  const [error, setError] = useState("");
  const [mealLabel, setMealLabel] = useState<"breakfast" | "lunch" | "dinner" | "snack">(
    getMealLabel(new Date().getHours())
  );
  const [saving, setSaving] = useState(false);
  const { addLog } = useDailyLog();

  async function handleParse(text: string) {
    setStep("loading");
    setError("");

    try {
      const res = await fetch("/api/log/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("Failed to parse");
      const { items: parsed } = await res.json();

      // For items without a match, look up nutrition via Gemini
      const withNutrition = await Promise.all(
        parsed.map(async (item: ParsedFoodItem) => {
          if (item.matched_food) return item;

          try {
            const lookupRes = await fetch("/api/gemini/lookup-food", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: `${item.quantity} ${item.unit} ${item.name}` }),
            });
            if (lookupRes.ok) {
              const { nutrition } = await lookupRes.json();
              return { ...item, estimated_nutrition: nutrition };
            }
          } catch { /* ignore lookup failure */ }
          return item;
        })
      );

      setItems(withNutrition);
      setStep("confirm");
    } catch {
      setError("Failed to parse your meal. Try rephrasing.");
      setStep("input");
    }
  }

  async function handleConfirm() {
    setSaving(true);
    const today = formatDate(new Date());

    for (const item of items) {
      const food: Food | undefined = item.matched_food;
      const est = item.estimated_nutrition;
      const servings = item.servings || 1;

      await addLog({
        log_date: today,
        meal_label: mealLabel,
        food_id: food?.id ?? null,
        food_name: food?.name ?? item.name,
        servings,
        calories: Math.round((food?.calories ?? est?.calories ?? 0) * servings),
        protein_g: Math.round((food?.protein_g ?? est?.protein_g ?? 0) * servings),
        carbs_g: Math.round((food?.carbs_g ?? est?.carbs_g ?? 0) * servings),
        fat_g: Math.round((food?.fat_g ?? est?.fat_g ?? 0) * servings),
        fiber_g: Math.round((food?.fiber_g ?? est?.fiber_g ?? 0) * servings),
        sugar_g: Math.round((food?.sugar_g ?? est?.sugar_g ?? 0) * servings),
        sodium_mg: Math.round((food?.sodium_mg ?? est?.sodium_mg ?? 0) * servings),
      });
    }

    setSaving(false);
    setStep("input");
    setItems([]);
  }

  function updateServings(index: number, servings: number) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, servings: Math.max(0.25, servings) } : item))
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Log Meal</h1>

      {/* Meal selector */}
      <div className="flex gap-2">
        {(["breakfast", "lunch", "dinner", "snack"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMealLabel(m)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg capitalize transition ${
              mealLabel === m
                ? "bg-green-600 text-white"
                : "bg-gray-900 text-gray-400 hover:bg-gray-800"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm rounded-xl p-3">
          {error}
        </div>
      )}

      {step === "input" && (
        <MealInput onSubmit={handleParse} loading={false} />
      )}

      {step === "loading" && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 mt-3 text-sm">Parsing your meal...</p>
        </div>
      )}

      {step === "confirm" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">Review items before logging:</p>

          {items.map((item, i) => {
            const food = item.matched_food;
            const est = item.estimated_nutrition;
            const cals = Math.round(
              (food?.calories ?? est?.calories ?? 0) * (item.servings || 1)
            );

            return (
              <div key={i} className="bg-gray-900 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium text-sm">
                      {food?.name ?? item.name}
                    </p>
                    {food ? (
                      <span className="text-[10px] text-green-400 bg-green-900/30 px-1.5 py-0.5 rounded">
                        Matched
                      </span>
                    ) : est ? (
                      <span className="text-[10px] text-amber-400 bg-amber-900/30 px-1.5 py-0.5 rounded">
                        Estimated
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-500">No nutrition data</span>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(i)}
                    className="text-gray-500 hover:text-red-400 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-gray-400">Servings:</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    value={item.servings}
                    onChange={(e) => updateServings(i, Number(e.target.value))}
                    className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                  <span className="text-xs text-gray-500 ml-auto">{cals} cal</span>
                </div>
              </div>
            );
          })}

          {items.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep("input");
                  setItems([]);
                }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-medium py-3 rounded-xl transition disabled:opacity-50"
              >
                {saving ? "Logging..." : "Confirm Log"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
