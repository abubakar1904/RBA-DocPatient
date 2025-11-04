import { Navigate } from "react-router-dom";

export default function RoleBasedRoute({ allowedRole, children }) {
  const role = localStorage.getItem("role");
  return role === allowedRole ? children : <Navigate to="/login" />;
}
