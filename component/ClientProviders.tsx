"use client";


import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { RegionProvider } from "@/context/RegionContext";
import { SettingsProvider } from "@/context/SettingsContext";
import type { ReactNode } from "react";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <RegionProvider>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </RegionProvider>
    </SettingsProvider>
  );
}
