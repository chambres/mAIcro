"use client";

import { useState } from "react";
import CameraCapture from "@/components/CameraCapture";
import NutritionTable from "@/components/NutritionTable";
import { useFoods } from "@/hooks/useFoods";
import { Food } from "@/lib/types";

type ExtractedNutrition = Omit<Food, "id" | "user_id" | "created_at" | "updated_at" | "source" | "image_url">;

export default function ScanPage() {
  const [step, setStep] = useState<"capture" | "loading" | "review">("capture");
  const [nutrition, setNutrition] = useState<ExtractedNutrition | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { addFood } = useFoods();

  async function handleCapture(file: File) {
    setStep("loading");
    setError("");
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/gemini/scan-label", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to scan label");

      const { nutrition: data } = await res.json();
      setNutrition(data);
      setStep("review");
    } catch {
      setError("Failed to extract nutrition data. Try again with a clearer photo.");
      setStep("capture");
    }
  }

  async function handleSave() {
    if (!nutrition) return;
    setSaving(true);

    await addFood({
      name: nutrition.name || "Unknown Food",
      brand: nutrition.brand || null,
      serving_size: nutrition.serving_size || "1 serving",
      calories: nutrition.calories || 0,
      protein_g: nutrition.protein_g || 0,
      carbs_g: nutrition.carbs_g || 0,
      fat_g: nutrition.fat_g || 0,
      fiber_g: nutrition.fiber_g || 0,
      sugar_g: nutrition.sugar_g || 0,
      saturated_fat_g: nutrition.saturated_fat_g ?? null,
      trans_fat_g: nutrition.trans_fat_g ?? null,
      cholesterol_mg: nutrition.cholesterol_mg ?? null,
      sodium_mg: nutrition.sodium_mg ?? null,
      potassium_mg: nutrition.potassium_mg ?? null,
      vitamin_a_pct: nutrition.vitamin_a_pct ?? null,
      vitamin_c_pct: nutrition.vitamin_c_pct ?? null,
      vitamin_d_pct: nutrition.vitamin_d_pct ?? null,
      calcium_pct: nutrition.calcium_pct ?? null,
      iron_pct: nutrition.iron_pct ?? null,
      source: "scan",
      image_url: null,
    });

    setSaving(false);
    setSaved(true);
  }

  function handleReset() {
    setStep("capture");
    setNutrition(null);
    setPreview(null);
    setError("");
    setSaved(false);
  }

  function handleEdit(field: string, value: string | number | null) {
    if (!nutrition) return;
    setNutrition({ ...nutrition, [field]: value });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Scan Label</h1>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm rounded-xl p-3">
          {error}
        </div>
      )}

      {step === "capture" && <CameraCapture onCapture={handleCapture} />}

      {step === "loading" && (
        <div className="space-y-4">
          {preview && (
            <img src={preview} alt="Captured label" className="w-full rounded-xl" />
          )}
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 mt-3 text-sm">Analyzing nutrition label...</p>
          </div>
        </div>
      )}

      {step === "review" && nutrition && (
        <div className="space-y-4">
          {preview && (
            <img src={preview} alt="Captured label" className="w-full rounded-xl" />
          )}

          {/* Editable name/brand */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Food Name</label>
              <input
                type="text"
                value={nutrition.name || ""}
                onChange={(e) => handleEdit("name", e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Brand</label>
              <input
                type="text"
                value={nutrition.brand || ""}
                onChange={(e) => handleEdit("brand", e.target.value || null)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Serving Size</label>
              <input
                type="text"
                value={nutrition.serving_size || ""}
                onChange={(e) => handleEdit("serving_size", e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <NutritionTable food={nutrition} />

          {saved ? (
            <div className="space-y-3">
              <div className="bg-green-900/30 border border-green-700 text-green-300 text-sm rounded-xl p-3 text-center">
                Saved to your food database!
              </div>
              <button
                onClick={handleReset}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition"
              >
                Scan Another
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition"
              >
                Retake
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-medium py-3 rounded-xl transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save to Foods"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
