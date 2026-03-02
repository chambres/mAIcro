"use client";

import { createClient } from "@/lib/supabase/client";
import { DailyLog } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";

export function useDailyLog(date?: Date) {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());
  const dateStr = formatDate(date ?? new Date());

  useEffect(() => {
    let cancelled = false;

    supabaseRef.current
      .from("daily_logs")
      .select("*")
      .eq("log_date", dateStr)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (!cancelled) {
          setLogs(data ?? []);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [dateStr]);

  async function refetch() {
    setLoading(true);
    const { data } = await supabaseRef.current
      .from("daily_logs")
      .select("*")
      .eq("log_date", dateStr)
      .order("created_at", { ascending: true });
    setLogs(data ?? []);
    setLoading(false);
  }

  async function addLog(
    entry: Omit<DailyLog, "id" | "user_id" | "created_at">
  ) {
    const supabase = supabaseRef.current;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("daily_logs")
      .insert({ ...entry, user_id: user.id })
      .select()
      .single();

    if (!error && data) {
      setLogs((prev) => [...prev, data]);
    }
    return { data, error };
  }

  async function deleteLog(id: string) {
    const { error } = await supabaseRef.current.from("daily_logs").delete().eq("id", id);
    if (!error) {
      setLogs((prev) => prev.filter((l) => l.id !== id));
    }
  }

  return { logs, loading, addLog, deleteLog, refetch };
}
