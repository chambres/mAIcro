"use client";

import { useState } from "react";
import { useDailyLog } from "@/hooks/useDailyLog";
import { useGoals } from "@/hooks/useGoals";
import { calculateTotals, formatDate, getMealLabel } from "@/lib/utils";
import { MealSuggestion } from "@/lib/types";

export default function SuggestionsPage() {
  const { logs, addLog } = useDailyLog();
  const { goals } = useGoals();
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loggedIndex, setLoggedIndex] = useState<number | null>(null);

  const totals = calculateTotals(logs);
  const g = goals ?? {
    calories: 2000, protein_g: 150, carbs_g: 250, fat_g: 65,
    fiber_g: 30, sugar_g: 50, sodium_mg: 2300,
  };

  const remaining = {
    calories: Math.max(0, g.calories - totals.calories),
    protein_g: Math.max(0, g.protein_g - totals.protein_g),
    carbs_g: Math.max(0, g.carbs_g - totals.carbs_g),
    fat_g: Math.max(0, g.fat_g - totals.fat_g),
  };

  async function getSuggestions() {
    setLoading(true);
    setError("");
    setSuggestions([]);
    setLoggedIndex(null);

    try {
      const res = await fetch("/api/gemini/suggest-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remaining_macros: remaining }),
      });

      if (!res.ok) throw new Error("Failed");
      const { suggestions: data } = await res.json();
      setSuggestions(data);
    } catch {
      setError("Failed to get suggestions. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function logMeal(suggestion: MealSuggestion, index: number) {
    const today = formatDate(new Date());
    const meal = getMealLabel(new Date().getHours());

    for (const item of suggestion.items) {
      await addLog({
        log_date: today,
        meal_label: meal,
        food_id: null,
        food_name: item.food_name,
        servings: item.servings,
        calories: Math.round(item.calories),
        protein_g: Math.round(item.protein_g),
        carbs_g: Math.round(item.carbs_g),
        fat_g: Math.round(item.fat_g),
        fiber_g: 0,
        sugar_g: 0,
        sodium_mg: 0,
      });
    }

    setLoggedIndex(index);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Meal Suggestions</h1>

      {/* Remaining macros */}
      <div className="bg-gray-900 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Remaining Today</h2>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-gray-800 rounded-lg p-2">
            <div className="text-green-400 font-bold">{remaining.calories}</div>
            <div className="text-gray-500">cal</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-2">
            <div className="text-blue-400 font-bold">{remaining.protein_g}g</div>
            <div className="text-gray-500">protein</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-2">
            <div className="text-amber-400 font-bold">{remaining.carbs_g}g</div>
            <div className="text-gray-500">carbs</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-2">
            <div className="text-red-400 font-bold">{remaining.fat_g}g</div>
            <div className="text-gray-500">fat</div>
          </div>
        </div>
      </div>

      <button
        onClick={getSuggestions}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-3 rounded-xl transition disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating...
          </span>
        ) : suggestions.length ? (
          "Get New Suggestions"
        ) : (
          "Get Meal Suggestions"
        )}
      </button>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm rounded-xl p-3">
          {error}
        </div>
      )}

      {/* Suggestion cards */}
      <div className="space-y-4">
        {suggestions.map((s, i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-4 space-y-3">
            <div>
              <h3 className="text-white font-semibold">{s.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{s.description}</p>
            </div>

            <div className="space-y-1.5">
              {s.items.map((item, j) => (
                <div key={j} className="flex justify-between text-sm">
                  <span className="text-gray-300">
                    {item.food_name}
                    {item.servings !== 1 && (
                      <span className="text-gray-500"> x{item.servings}</span>
                    )}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {Math.round(item.calories)} cal
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-xs text-gray-400 pt-2 border-t border-gray-800">
              <span>{s.total_calories} cal</span>
              <span>{s.total_protein_g}p · {s.total_carbs_g}c · {s.total_fat_g}f</span>
            </div>

            {loggedIndex === i ? (
              <div className="text-center text-green-400 text-sm font-medium py-2">
                Logged!
              </div>
            ) : (
              <button
                onClick={() => logMeal(s, i)}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium py-2.5 rounded-lg transition"
              >
                Log This Meal
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
