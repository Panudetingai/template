"use client";

import { useEffect } from "react";

/**
 * Registers Service Worker for PWA (Next.js docs approach)
 * updateViaCache: 'none' ensures SW always fetches latest
 */
export function PWARegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })
        .catch(() => {});
    }
  }, []);

  return null;
}
