"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { loginUser, registerUser } from "@/server/auth";
import type { AuthUser } from "@/server/auth";

interface UserData {
  id: string;
  name: string;
  phone: string | null;
}

interface AuthContextType {
  user: UserData | null;
  isLoggedIn: boolean;
  login: (username: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AUTH_USER_KEY = "ecommerce-auth-user";
const AUTH_TOKEN_KEY = "ecommerce-auth-token";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitialUser(): UserData | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(AUTH_USER_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.id) return parsed as UserData;
    }
  } catch {
    // ignore
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(getInitialUser);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }, [user]);

  const login = useCallback(async (username: string, phone: string): Promise<{ success: boolean; error?: string }> => {
    const result = await loginUser(username, phone);
    if (result.success) {
      const { id, name, phone: userPhone, token } = result.user;
      setUser({ id, name, phone: userPhone });
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      return { success: true };
    }
    return { success: false, error: result.error };
  }, []);

  const register = useCallback(async (name: string, phone: string): Promise<{ success: boolean; error?: string }> => {
    const result = await registerUser(name, phone);
    if (result.success) {
      const { id, name: userName, phone: userPhone, token } = result.user;
      setUser({ id, name: userName, phone: userPhone });
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      return { success: true };
    }
    return { success: false, error: result.error };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
