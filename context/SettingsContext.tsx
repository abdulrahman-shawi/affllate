"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface Settings {
  siteName: string;
  companyEmail: string;
  companyPhone: string;
  siteCurrency: string;
  usdToTryRate: number;
  facebookUrl: string;
  instagramUrl: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  topBannerText: string;
}

interface SettingsContextValue extends Settings {
  loading: boolean;
}

const defaultSettings: Settings = {
  siteName: "سفراء skynova",
  companyEmail: "",
  companyPhone: "",
  siteCurrency: "USD",
  usdToTryRate: 0,
  facebookUrl: "",
  instagramUrl: "",
  logo: "",
  primaryColor: "#10b981",
  secondaryColor: "#0f766e",
  topBannerText: "",
};

const SettingsContext = createContext<SettingsContextValue>({
  ...defaultSettings,
  loading: true,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = () => {
      fetch("/api/settings", { cache: "no-store" })
        .then((res) => res.json())
        .then((data: Partial<Settings>) => {
          const merged = { ...defaultSettings, ...data };
          setSettings(merged);
          applyThemeColors(merged.primaryColor, merged.secondaryColor);
        })
        .catch(() => {
          setSettings(defaultSettings);
          applyThemeColors(defaultSettings.primaryColor, defaultSettings.secondaryColor);
        })
        .finally(() => setLoading(false));
    };

    loadSettings();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadSettings();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", loadSettings);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", loadSettings);
    };
  }, []);

  function applyThemeColors(primary: string, secondary: string) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--theme-primary", primary);
    root.style.setProperty("--theme-secondary", secondary);
    root.style.setProperty("--theme-primary-light", lighten(primary, 20));
    root.style.setProperty("--theme-primary-dark", darken(primary, 15));
    root.style.setProperty("--theme-primary-50", lighten(primary, 45));
    root.style.setProperty("--theme-primary-100", lighten(primary, 35));
  }

  function lighten(color: string, percent: number) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
    const B = Math.min(255, (num & 0x0000ff) + amt);
    return (
      "#" +
      (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
    );
  }

  function darken(color: string, percent: number) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
    const B = Math.max(0, (num & 0x0000ff) - amt);
    return (
      "#" +
      (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
    );
  }

  return (
    <SettingsContext.Provider value={{ ...settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
