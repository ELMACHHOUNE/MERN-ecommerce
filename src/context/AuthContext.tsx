import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { API_BASE } from "@/api/products";

type User = {
  id: string;
  email: string;
  name?: string;
  role?: string;
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const USER_STORAGE_KEY = "bb_user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);

        // Optional: Try to verify with backend if endpoint exists
        fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error("Invalid token");
          })
          .then((data) => {
            if (data.user) {
              setUser(data.user);
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
            }
          })
          .catch(() => {
            // If verification fails, keep the stored user but log warning
            console.warn("Could not verify token with backend");
          });
      } catch (error) {
        localStorage.removeItem("authToken");
        localStorage.removeItem(USER_STORAGE_KEY);
        setToken(null);
      }
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    // Ensure user object has id field (some APIs return _id instead)
    const userData = {
      ...data.user,
      id: data.user.id || data.user._id,
    };

    localStorage.setItem("authToken", data.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    setToken(data.token);
  };

  const register = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");

    // Ensure user object has id field (some APIs return _id instead)
    const userData = {
      ...data.user,
      id: data.user.id || data.user._id,
    };

    localStorage.setItem("authToken", data.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    setToken(data.token);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    setToken(null);
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    loading,
    token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
