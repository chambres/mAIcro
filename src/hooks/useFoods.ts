"use client";

import { createClient } from "@/lib/supabase/client";
import { Food } from "@/lib/types";
import { useEffect, useState, useRef } from "react";

export function useFoods() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    let cancelled = false;
    const supabase = supabaseRef.current;

    supabase
      .from("foods")
      .select("*")
      .order("name", { ascending: true })
      .then(({ data }) => {
        if (!cancelled) {
          setFoods(data ?? []);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  async function refetch() {
    const { data } = await supabaseRef.current
      .from("foods")
      .select("*")
      .order("name", { ascending: true });
    setFoods(data ?? []);
  }

  async function searchFoods(query: string): Promise<Food[]> {
    if (!query.trim()) return foods;
    const { data } = await supabaseRef.current
      .from("foods")
      .select("*")
      .ilike("name", `%${query}%`)
      .order("name", { ascending: true })
      .limit(20);
    return data ?? [];
  }

  async function addFood(
    food: Omit<Food, "id" | "user_id" | "created_at" | "updated_at">
  ) {
    const supabase = supabaseRef.current;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("foods")
      .insert({ ...food, user_id: user.id })
      .select()
      .single();

    if (!error && data) {
      setFoods((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    }
    return data;
  }

  async function deleteFood(id: string) {
    const { error } = await supabaseRef.current.from("foods").delete().eq("id", id);
    if (!error) {
      setFoods((prev) => prev.filter((f) => f.id !== id));
    }
  }

  async function updateFood(id: string, updates: Partial<Food>) {
    const { data, error } = await supabaseRef.current
      .from("foods")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      setFoods((prev) => prev.map((f) => (f.id === id ? data : f)));
    }
    return data;
  }

  return { foods, loading, searchFoods, addFood, deleteFood, updateFood, refetch };
}
