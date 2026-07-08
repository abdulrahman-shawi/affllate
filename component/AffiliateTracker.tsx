"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";

export default function AffiliateTracker() {
  useEffect(() => {
    const code = Cookies.get("affiliate-code");
    if (code) {
      localStorage.setItem("affiliate-code", code);
    }
  }, []);

  return null;
}
