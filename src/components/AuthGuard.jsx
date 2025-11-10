import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function AuthGuard({ children }) {
  const { isAuthenticated } = useAuthStore();
  
  // If user is logged in, redirect to their dashboard
  if (isAuthenticated) {
    const role = useAuthStore.getState().role;
    const user = useAuthStore.getState().user;
    
    if ((role === "doctor" || role === "patient") && !user?.profileCompleted) {
      return <Navigate to="/profile-setup" replace />;
    }
    
    if (role === "doctor") return <Navigate to="/doctor" replace />;
    if (role === "patient") return <Navigate to="/patient" replace />;
    if (role === "admin") return <Navigate to="/admin" replace />;

    return <Navigate to="/" replace />;
  }
  
  return children;
}


