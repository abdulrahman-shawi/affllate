"use client";

import { useEffect } from "react";

interface AffiliateVisitTrackerProps {
  code: string;
}

export default function AffiliateVisitTracker({ code }: AffiliateVisitTrackerProps) {
  useEffect(() => {
    localStorage.setItem("affiliate-code", code);

    void fetch(`/api/affiliate/track?code=${encodeURIComponent(code)}`, {
      credentials: "include",
      cache: "no-store",
    }).catch(() => {
      // Ignore background tracking failures so the product page still renders.
    });
  }, [code]);

  return null;
}