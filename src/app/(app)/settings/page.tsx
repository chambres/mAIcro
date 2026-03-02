"use client";

import { useGoals } from "@/hooks/useGoals";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

type GoalKey = "calories" | "protein_g" | "carbs_g" | "fat_g" | "fiber_g" | "sugar_g" | "sodium_mg";

interface GoalField {
  key: GoalKey;
  label: string;
  unit: string;
}

const GOAL_FIELDS: GoalField[] = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein_g", label: "Protein", unit: "g" },
  { key: "carbs_g", label: "Carbs", unit: "g" },
  { key: "fat_g", label: "Fat", unit: "g" },
  { key: "fiber_g", label: "Fiber", unit: "g" },
  { key: "sugar_g", label: "Sugar", unit: "g" },
  { key: "sodium_mg", label: "Sodium", unit: "mg" },
];

export default function SettingsPage() {
  const { goals, loading, saveGoals, defaults } = useGoals();
  const { user } = useUser();
  const router = useRouter();
  const supabase = createClient();

  const initialValues = useMemo(() => {
    if (goals) {
      return {
        calories: goals.calories,
        protein_g: goals.protein_g,
        carbs_g: goals.carbs_g,
        fat_g: goals.fat_g,
        fiber_g: goals.fiber_g,
        sugar_g: goals.sugar_g,
        sodium_mg: goals.sodium_mg,
      };
    }
    return { ...defaults };
  }, [goals, defaults]);

  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const values = { ...initialValues, ...overrides };

  async function handleSave() {
    setSaving(true);
    await saveGoals(values);
    setSaving(false);
    setSaved(true);
    setOverrides({});
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Profile */}
      <div className="bg-gray-900 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-300 mb-2">Profile</h2>
        <p className="text-sm text-gray-400">{user?.email}</p>
      </div>

      {/* Macro Goals */}
      <div className="bg-gray-900 rounded-xl p-4 space-y-4">
        <h2 className="text-sm font-semibold text-gray-300">Daily Macro Goals</h2>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : (
          <>
            <div className="space-y-3">
              {GOAL_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center gap-3">
                  <label className="text-sm text-gray-400 w-20">{field.label}</label>
                  <input
                    type="number"
                    value={values[field.key] ?? ""}
                    onChange={(e) =>
                      setOverrides((v) => ({ ...v, [field.key]: Number(e.target.value) }))
                    }
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-xs text-gray-500 w-8">{field.unit}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {saving ? "Saving..." : saved ? "Saved!" : "Save Goals"}
            </button>
          </>
        )}
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="w-full bg-gray-900 hover:bg-gray-800 text-red-400 font-medium py-3 rounded-xl transition"
      >
        Sign Out
      </button>
    </div>
  );
}
