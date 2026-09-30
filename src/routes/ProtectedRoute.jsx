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

export function RoleRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const role = String(user?.role || '').toLowerCase();
  const studentAllowedPaths = ['/dashboard', '/student-leave-application'];
  const teacherRestrictedPaths = ['/classes', '/registered-students', '/teachers'];

  if (role === 'student' && !studentAllowedPaths.includes(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }
  if (role === 'teacher' && teacherRestrictedPaths.includes(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
