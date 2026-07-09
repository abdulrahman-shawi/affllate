"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type CountryCode = "TR" | "SY";

interface RegionContextType {
  country: CountryCode;
  setCountry: (country: CountryCode) => void;
  isDetecting: boolean;
}

const REGION_KEY = "skynova-country";
const REGION_COOKIE = "skynova-country";
const VALID_COUNTRIES: CountryCode[] = ["TR", "SY"];
const DEFAULT_COUNTRY: CountryCode = "SY";

function isValidCountry(value: string | undefined | null): value is CountryCode {
  return !!value && VALID_COUNTRIES.includes(value as CountryCode);
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

function getStoredCountry(): CountryCode | null {
  if (typeof window === "undefined") return null;
  try {
    const local = localStorage.getItem(REGION_KEY);
    if (isValidCountry(local)) return local;
  } catch {
    // ignore
  }
  const cookie = getCookie(REGION_COOKIE);
  if (isValidCountry(cookie)) return cookie;
  return null;
}

async function detectCountryByIp(): Promise<CountryCode> {
  try {
    const res = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    if (!res.ok) return DEFAULT_COUNTRY;
    const data = await res.json();
    const code = String(data?.country_code || "").toUpperCase();
    return code === "TR" ? "TR" : DEFAULT_COUNTRY;
  } catch {
    return DEFAULT_COUNTRY;
  }
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [isDetecting, setIsDetecting] = useState(true);

  const applyCountry = useCallback((next: CountryCode, { reload = false }: { reload?: boolean } = {}) => {
    setCountryState(next);
    try {
      localStorage.setItem(REGION_KEY, next);
    } catch {
      // ignore
    }
    setCookie(REGION_COOKIE, next);
    if (reload) {
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const stored = getStoredCountry();

      if (stored) {
        const cookieValue = getCookie(REGION_COOKIE);
        const needsReload = !cookieValue || cookieValue !== stored;
        applyCountry(stored, { reload: needsReload });
        setIsDetecting(false);
        return;
      }

      const detected = await detectCountryByIp();
      if (!cancelled) {
        applyCountry(detected, { reload: detected !== DEFAULT_COUNTRY });
        setIsDetecting(false);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [applyCountry]);

  const setCountry = useCallback(
    (next: CountryCode) => {
      applyCountry(next, { reload: true });
    },
    [applyCountry]
  );

  return (
    <RegionContext.Provider value={{ country, setCountry, isDetecting }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) throw new Error("useRegion must be used within RegionProvider");
  return context;
}
