import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { api, setAuth, clearAuth, getStoredUser } from "@/lib/api";

type User = {
  id: string;
  email: string;
  role: "user" | "admin";
  fullName?: string;
};
type AuthCtx = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(getStoredUser<User>());
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("auth_token")
  );

  useEffect(() => {
    // Keep state in sync if localStorage changes (optional)
    const handler = () => {
      setUser(getStoredUser<User>());
      setToken(localStorage.getItem("auth_token"));
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>("/auth/login", {
      email,
      password,
    });
    setAuth(res.token, res.user);
    setUser(res.user);
    setToken(res.token);
  };

  const register = async (
    email: string,
    password: string,
    fullName?: string
  ) => {
    const res = await api.post<{ token: string; user: User }>(
      "/auth/register",
      { email, password, fullName }
    );
    setAuth(res.token, res.user);
    setUser(res.user);
    setToken(res.token);
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({ user, token, login, register, logout }),
    [user, token]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
