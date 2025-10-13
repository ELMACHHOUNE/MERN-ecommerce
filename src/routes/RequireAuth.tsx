import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const RequireAuth = ({ children }: { children: ReactNode }) => {
  const auth = (typeof useAuth === "function" ? (useAuth as any)() : {}) || {};
  const token: string | null = auth?.token ?? localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return <>{children}</>;
};

export default RequireAuth;
