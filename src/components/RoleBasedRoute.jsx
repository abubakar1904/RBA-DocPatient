import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function RoleBasedRoute({ allowedRole, allowedRoles, children }) {
  const { role, user } = useAuthStore();

  const rolesToCheckRaw = allowedRoles ?? allowedRole;
  const rolesToCheck = Array.isArray(rolesToCheckRaw) ? rolesToCheckRaw : [rolesToCheckRaw];

  if (!rolesToCheck.includes(role)) {
    return <Navigate to="/" replace />;
  }

  if ((role === "doctor" || role === "patient") && !user?.profileCompleted) {
    return <Navigate to="/profile-setup" replace />;
  }

  return children;
}
