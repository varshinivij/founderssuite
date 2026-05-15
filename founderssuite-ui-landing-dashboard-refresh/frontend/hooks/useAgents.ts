"use client";

import { useCallback, useEffect, useState } from "react";
import type { Agent } from "@/types";
import { getAgents } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export function useAgents() {
  const { user } = useAuth();
  const [data, setData] = useState<Agent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const agents = await getAgents(userId);
      setData(agents);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load agents");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const userId = user?.id ?? "";
    if (!userId) {
      setData([]);
      setIsLoading(false);
      return;
    }
    void load(userId);
  }, [user?.id, load]);

  const mutate = useCallback(() => {
    if (user?.id) void load(user.id);
  }, [user?.id, load]);

  return { data, error, isLoading, mutate };
}
