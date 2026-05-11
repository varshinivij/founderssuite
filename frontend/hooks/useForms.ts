"use client";

import { useEffect, useState } from "react";
import type { ValidationForm } from "@/types";
import { getForms } from "@/lib/api";

export function useForms() {
  const [data, setData] = useState<ValidationForm[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getForms()
      .then((forms) => {
        if (cancelled) return;
        setData(forms);
        setError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load forms");
        setData(null);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error, isLoading };
}

