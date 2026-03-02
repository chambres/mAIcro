"use client";

import { useFoods } from "@/hooks/useFoods";
import { Food } from "@/lib/types";
import { useState } from "react";

export default function FoodsPage() {
  const { foods, loading, searchFoods, deleteFood } = useFoods();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const displayFoods = results ?? foods;

  async function handleSearch(q: string) {
    setQuery(q);
    if (q.trim()) {
      const found = await searchFoods(q);
      setResults(found);
    } else {
      setResults(null);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteFood(id);
    setDeleting(null);
    setExpanded(null);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">My Foods</h1>

      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search foods..."
        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading...</div>
      ) : displayFoods.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {query ? "No foods match your search" : "No foods yet. Scan a label to get started!"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayFoods.map((food) => (
            <div key={food.id} className="bg-gray-900 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === food.id ? null : food.id)}
                className="w-full text-left p-4 flex justify-between items-center"
              >
                <div>
                  <p className="text-white font-medium text-sm">{food.name}</p>
                  {food.brand && (
                    <p className="text-xs text-gray-500">{food.brand}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {food.calories} cal &middot; {food.protein_g}p &middot; {food.carbs_g}c &middot; {food.fat_g}f
                  </p>
                </div>
                <span className="text-xs text-gray-600 px-2 py-0.5 bg-gray-800 rounded">
                  {food.source}
                </span>
              </button>

              {expanded === food.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-800 pt-3">
                  <div className="text-xs text-gray-500">
                    Serving: {food.serving_size}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-gray-800 rounded-lg p-2">
                      <div className="text-white font-bold">{food.calories}</div>
                      <div className="text-gray-500">cal</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2">
                      <div className="text-blue-400 font-bold">{food.protein_g}g</div>
                      <div className="text-gray-500">protein</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2">
                      <div className="text-amber-400 font-bold">{food.carbs_g}g</div>
                      <div className="text-gray-500">carbs</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2">
                      <div className="text-red-400 font-bold">{food.fat_g}g</div>
                      <div className="text-gray-500">fat</div>
                    </div>
                  </div>
                  {food.fiber_g > 0 && (
                    <div className="text-xs text-gray-400">
                      Fiber: {food.fiber_g}g &middot; Sugar: {food.sugar_g}g
                      {food.sodium_mg != null && ` · Sodium: ${food.sodium_mg}mg`}
                    </div>
                  )}
                  <button
                    onClick={() => handleDelete(food.id)}
                    disabled={deleting === food.id}
                    className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-400 text-sm font-medium py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {deleting === food.id ? "Deleting..." : "Delete Food"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
