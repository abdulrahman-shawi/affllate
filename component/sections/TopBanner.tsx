"use client";

import { useState } from 'react';
import { X } from 'lucide-react';
import { useSettings } from "@/context/SettingsContext";

export default function TopBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const { topBannerText } = useSettings();

  if (!isVisible || !topBannerText) return null;

  return (
    <div
      className="text-white h-10 flex items-center justify-center relative animate-in slide-in-from-top duration-500"
      style={{ backgroundColor: "var(--theme-primary)" }}
    >
      <p className="text-sm font-medium font-tajawal px-8 text-center">
        {topBannerText}
      </p>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
