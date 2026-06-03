import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();

  // Already logged in → send to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}