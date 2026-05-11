"use client";

import { useEffect, useState } from "react";
import type { Agent } from "@/types";
import { getAgents } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export function useAgents() {
  const { user } = useAuth();
  const [data, setData] = useState<Agent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    // If the current auth user isn't a backend UUID yet, keep mock agent list.
    const userId = user?.id ?? "";
    if (!userId) {
      setData([]);
      setIsLoading(false);
      return;
    }

    getAgents(userId)
      .then((agents) => {
        if (cancelled) return;
        setData(agents);
        setError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load agents");
        setData(null);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return { data, error, isLoading };
}

