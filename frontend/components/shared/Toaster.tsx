"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      richColors
      position="top-right"
      toastOptions={{
        className:
          "bg-bg-accent text-white border border-divider shadow-card",
      }}
    />
  );
}

