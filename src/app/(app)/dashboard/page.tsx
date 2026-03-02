"use client";

import { useDailyLog } from "@/hooks/useDailyLog";
import { useGoals } from "@/hooks/useGoals";
import ProgressRing from "@/components/ProgressRing";
import MacroSummary from "@/components/MacroSummary";
import InstallPrompt from "@/components/InstallPrompt";
import { calculateTotals } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const { logs, loading: logsLoading } = useDailyLog();
  const { goals, loading: goalsLoading } = useGoals();

  const totals = calculateTotals(logs);
  const g = goals ?? {
    id: "", user_id: "",
    calories: 2000, protein_g: 150, carbs_g: 250, fat_g: 65,
    fiber_g: 30, sugar_g: 50, sodium_mg: 2300,
  };

  const loading = logsLoading || goalsLoading;

  const mealGroups = {
    breakfast: logs.filter((l) => l.meal_label === "breakfast"),
    lunch: logs.filter((l) => l.meal_label === "lunch"),
    dinner: logs.filter((l) => l.meal_label === "dinner"),
    snack: logs.filter((l) => l.meal_label === "snack"),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Today</h1>
          <p className="text-sm text-gray-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <Link
          href="/settings"
          className="text-gray-400 hover:text-gray-300 p-2"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </Link>
      </div>

      <InstallPrompt />

      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading...</div>
      ) : (
        <>
          {/* Progress Rings */}
          <div className="bg-gray-900 rounded-2xl p-5">
            <div className="flex justify-around">
              <ProgressRing value={totals.calories} max={g.calories} color="#22c55e" label="Calories" />
              <ProgressRing value={totals.protein_g} max={g.protein_g} color="#3b82f6" label="Protein" unit="g" />
              <ProgressRing value={totals.carbs_g} max={g.carbs_g} color="#f59e0b" label="Carbs" unit="g" />
              <ProgressRing value={totals.fat_g} max={g.fat_g} color="#ef4444" label="Fat" unit="g" />
            </div>
          </div>

          {/* Detailed Bars */}
          <div className="bg-gray-900 rounded-2xl p-5">
            <MacroSummary totals={totals} goals={goals} />
          </div>

          {/* Meals */}
          <div className="space-y-3">
            {(["breakfast", "lunch", "dinner", "snack"] as const).map((meal) => (
              <div key={meal} className="bg-gray-900 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-gray-300 capitalize">{meal}</h3>
                  <span className="text-xs text-gray-500">
                    {Math.round(mealGroups[meal].reduce((s, l) => s + l.calories, 0))} cal
                  </span>
                </div>
                {mealGroups[meal].length === 0 ? (
                  <p className="text-xs text-gray-600">No items logged</p>
                ) : (
                  <div className="space-y-1.5">
                    {mealGroups[meal].map((log) => (
                      <div key={log.id} className="flex justify-between text-sm">
                        <span className="text-gray-300">
                          {log.food_name}
                          {log.servings !== 1 && (
                            <span className="text-gray-500"> x{log.servings}</span>
                          )}
                        </span>
                        <span className="text-gray-500">{Math.round(log.calories)} cal</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/log"
              className="bg-green-600 hover:bg-green-500 text-white text-center py-3 rounded-xl font-medium transition"
            >
              Log Meal
            </Link>
            <Link
              href="/suggestions"
              className="bg-gray-800 hover:bg-gray-700 text-white text-center py-3 rounded-xl font-medium transition"
            >
              Get Suggestions
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
