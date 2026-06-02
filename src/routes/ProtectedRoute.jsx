import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  console.log("ProtectedRoute → isAuthenticated:", isAuthenticated) // ← add this

  if (!isAuthenticated) {
    // Preserve where the user was trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}