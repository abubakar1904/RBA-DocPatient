import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import ProfileDropdown from "../components/ProfileDropdown";
import "../auth.css";


export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", width: "100%", textAlign: "center" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem", color: "#1e293b" }}>Welcome to RBA</h1>
        <p style={{ fontSize: "1.2rem", color: "#64748b", marginBottom: "3rem" }}>Your trusted healthcare platform</p>

        {isAuthenticated ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem" }}>
            <ProfileDropdown />
          </div>
        ) : (
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to="/login"
              style={{
                background: "#3b82f6",
                color: "white",
                padding: "0.75rem 2rem",
                borderRadius: "10px",
                textDecoration: "none",
                fontSize: "1rem",
                fontWeight: 500,
                transition: "0.3s",
                display: "inline-block",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#2563eb")}
              onMouseLeave={(e) => (e.target.style.background = "#3b82f6")}
            >
              Login
            </Link>
            <Link
              to="/signup"
              style={{
                background: "white",
                color: "#3b82f6",
                padding: "0.75rem 2rem",
                borderRadius: "10px",
                textDecoration: "none",
                fontSize: "1rem",
                fontWeight: 500,
                border: "2px solid #3b82f6",
                transition: "0.3s",
                display: "inline-block",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#f1f5f9";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "white";
              }}
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}


