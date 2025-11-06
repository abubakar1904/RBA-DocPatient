import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function RoleBasedRoute({ allowedRole, children }) {
  const { role, user } = useAuthStore();
  
  if (role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  
  // If profile not completed, redirect to profile setup
  if (!user?.profileCompleted) {
    return <Navigate to="/profile-setup" replace />;
  }
  
  return children;
}
