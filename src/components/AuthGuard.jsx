import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function AuthGuard({ children }) {
  const { isAuthenticated } = useAuthStore();
  
  // If user is logged in, redirect to their dashboard
  if (isAuthenticated) {
    const role = useAuthStore.getState().role;
    const user = useAuthStore.getState().user;
    
    if (!user?.profileCompleted) {
      return <Navigate to="/profile-setup" replace />;
    }
    
    return <Navigate to={role === "doctor" ? "/doctor" : "/patient"} replace />;
  }
  
  return children;
}

