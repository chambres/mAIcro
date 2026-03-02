import { DailyLog, MacroTotals } from "./types";

export function calculateTotals(logs: DailyLog[]): MacroTotals {
  return logs.reduce(
    (totals, log) => ({
      calories: totals.calories + log.calories,
      protein_g: totals.protein_g + log.protein_g,
      carbs_g: totals.carbs_g + log.carbs_g,
      fat_g: totals.fat_g + log.fat_g,
      fiber_g: totals.fiber_g + log.fiber_g,
      sugar_g: totals.sugar_g + log.sugar_g,
      sodium_mg: totals.sodium_mg + log.sodium_mg,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, sugar_g: 0, sodium_mg: 0 }
  );
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getMealLabel(hour: number): "breakfast" | "lunch" | "dinner" | "snack" {
  if (hour < 11) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 20) return "dinner";
  return "snack";
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
