"use client";

import { useState } from "react";
import { useDailyLog } from "@/hooks/useDailyLog";
import { useGoals } from "@/hooks/useGoals";
import MacroSummary from "@/components/MacroSummary";
import { calculateTotals, formatDate } from "@/lib/utils";

export default function HistoryPage() {
  const [date, setDate] = useState(new Date());
  const { logs, loading } = useDailyLog(date);
  const { goals } = useGoals();

  const totals = calculateTotals(logs);
  const isToday = formatDate(date) === formatDate(new Date());

  function changeDate(delta: number) {
    setDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + delta);
      return next;
    });
  }

  const mealGroups = {
    breakfast: logs.filter((l) => l.meal_label === "breakfast"),
    lunch: logs.filter((l) => l.meal_label === "lunch"),
    dinner: logs.filter((l) => l.meal_label === "dinner"),
    snack: logs.filter((l) => l.meal_label === "snack"),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">History</h1>

      {/* Date picker */}
      <div className="flex items-center justify-between bg-gray-900 rounded-xl p-3">
        <button
          onClick={() => changeDate(-1)}
          className="text-gray-400 hover:text-white p-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="text-center">
          <input
            type="date"
            value={formatDate(date)}
            onChange={(e) => setDate(new Date(e.target.value + "T12:00:00"))}
            className="bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer"
          />
          {isToday && <p className="text-xs text-green-400">Today</p>}
        </div>
        <button
          onClick={() => changeDate(1)}
          disabled={isToday}
          className="text-gray-400 hover:text-white p-2 disabled:opacity-30"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading...</div>
      ) : (
        <>
          {/* Macro summary */}
          <div className="bg-gray-900 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-gray-300">Daily Summary</h2>
              <span className="text-xs text-gray-500">{logs.length} items</span>
            </div>
            <MacroSummary totals={totals} goals={goals} />
          </div>

          {/* Meal log */}
          {logs.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-8">
              No meals logged for this day
            </p>
          ) : (
            <div className="space-y-3">
              {(["breakfast", "lunch", "dinner", "snack"] as const).map((meal) => {
                if (mealGroups[meal].length === 0) return null;
                return (
                  <div key={meal} className="bg-gray-900 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-300 capitalize mb-2">
                      {meal}
                    </h3>
                    <div className="space-y-2">
                      {mealGroups[meal].map((log) => (
                        <div key={log.id} className="flex justify-between text-sm">
                          <span className="text-gray-300">
                            {log.food_name}
                            {log.servings !== 1 && (
                              <span className="text-gray-500"> x{log.servings}</span>
                            )}
                          </span>
                          <div className="text-right text-xs text-gray-500">
                            <span>{Math.round(log.calories)} cal</span>
                            <span className="ml-2">{log.protein_g}p {log.carbs_g}c {log.fat_g}f</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
