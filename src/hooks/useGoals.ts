"use client";

import { createClient } from "@/lib/supabase/client";
import { Goals } from "@/lib/types";
import { useEffect, useState, useRef } from "react";

const DEFAULT_GOALS: Omit<Goals, "id" | "user_id"> = {
  calories: 2000,
  protein_g: 150,
  carbs_g: 250,
  fat_g: 65,
  fiber_g: 30,
  sugar_g: 50,
  sodium_mg: 2300,
};

export function useGoals() {
  const [goals, setGoals] = useState<Goals | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    let cancelled = false;

    supabaseRef.current
      .from("goals")
      .select("*")
      .single()
      .then(({ data }) => {
        if (!cancelled) {
          setGoals(data);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  async function saveGoals(updates: Partial<Omit<Goals, "id" | "user_id">>) {
    const supabase = supabaseRef.current;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (goals) {
      const { data, error } = await supabase
        .from("goals")
        .update(updates)
        .eq("id", goals.id)
        .select()
        .single();
      if (!error && data) setGoals(data);
    } else {
      const { data, error } = await supabase
        .from("goals")
        .insert({ ...DEFAULT_GOALS, ...updates, user_id: user.id })
        .select()
        .single();
      if (!error && data) setGoals(data);
    }
  }

  return { goals, loading, saveGoals, defaults: DEFAULT_GOALS };
}
