"use client";

import { Food } from "@/lib/types";

interface NutritionTableProps {
  food: Partial<Food>;
}

function Row({ label, value, unit }: { label: string; value: number | null | undefined; unit: string }) {
  if (value == null) return null;
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-800 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-medium">{value}{unit}</span>
    </div>
  );
}

export default function NutritionTable({ food }: NutritionTableProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 space-y-0">
      <h3 className="text-sm font-semibold text-gray-300 mb-2">Nutrition Facts</h3>
      {food.serving_size && (
        <div className="text-xs text-gray-500 mb-2">Serving: {food.serving_size}</div>
      )}
      <Row label="Calories" value={food.calories} unit="" />
      <Row label="Total Fat" value={food.fat_g} unit="g" />
      <Row label="  Saturated Fat" value={food.saturated_fat_g} unit="g" />
      <Row label="  Trans Fat" value={food.trans_fat_g} unit="g" />
      <Row label="Cholesterol" value={food.cholesterol_mg} unit="mg" />
      <Row label="Sodium" value={food.sodium_mg} unit="mg" />
      <Row label="Total Carbs" value={food.carbs_g} unit="g" />
      <Row label="  Fiber" value={food.fiber_g} unit="g" />
      <Row label="  Sugars" value={food.sugar_g} unit="g" />
      <Row label="Protein" value={food.protein_g} unit="g" />
      <Row label="Potassium" value={food.potassium_mg} unit="mg" />
      <Row label="Vitamin A" value={food.vitamin_a_pct} unit="%" />
      <Row label="Vitamin C" value={food.vitamin_c_pct} unit="%" />
      <Row label="Vitamin D" value={food.vitamin_d_pct} unit="%" />
      <Row label="Calcium" value={food.calcium_pct} unit="%" />
      <Row label="Iron" value={food.iron_pct} unit="%" />
    </div>
  );
}
