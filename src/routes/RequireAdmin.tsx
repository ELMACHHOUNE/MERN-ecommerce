import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type Props = { children: React.ReactNode };

const RequireAdmin: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const { user, loading } = useAuth?.() ?? { user: null, loading: false };

  if (loading) return null;
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default RequireAdmin;
