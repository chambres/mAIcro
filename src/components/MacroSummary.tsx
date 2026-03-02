"use client";

import { MacroTotals, Goals } from "@/lib/types";

interface MacroSummaryProps {
  totals: MacroTotals;
  goals: Goals | null;
}

function MacroBar({
  label,
  value,
  max,
  color,
  unit,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  unit: string;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300">
          {Math.round(value)}{unit} / {max}{unit}
        </span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function MacroSummary({ totals, goals }: MacroSummaryProps) {
  const g = goals ?? {
    calories: 2000,
    protein_g: 150,
    carbs_g: 250,
    fat_g: 65,
    fiber_g: 30,
    sugar_g: 50,
    sodium_mg: 2300,
  };

  return (
    <div className="space-y-3">
      <MacroBar label="Calories" value={totals.calories} max={g.calories} color="#22c55e" unit="" />
      <MacroBar label="Protein" value={totals.protein_g} max={g.protein_g} color="#3b82f6" unit="g" />
      <MacroBar label="Carbs" value={totals.carbs_g} max={g.carbs_g} color="#f59e0b" unit="g" />
      <MacroBar label="Fat" value={totals.fat_g} max={g.fat_g} color="#ef4444" unit="g" />
      <MacroBar label="Fiber" value={totals.fiber_g} max={g.fiber_g} color="#8b5cf6" unit="g" />
    </div>
  );
}
