import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const avatarUrl = user?.avatarUrl
    ? (user.avatarUrl.startsWith("http") ? user.avatarUrl : `http://localhost:5000${user.avatarUrl}`)
    : null;

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "4px 8px",
          borderRadius: "8px",
        }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "14px", fontWeight: "bold" }}>
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}
        <span style={{ color: "#1e293b", fontSize: "14px", fontWeight: 500 }}>{user?.name || "User"}</span>
        <span style={{ color: "#64748b", fontSize: "12px" }}>▼</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "8px",
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            minWidth: "180px",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 500, color: "#1e293b" }}>{user?.name || "User"}</p>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>{user?.email}</p>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              navigate("/profile-setup");
            }}
            style={{
              width: "100%",
              padding: "10px 16px",
              background: "none",
              border: "none",
              textAlign: "left",
              cursor: "pointer",
              fontSize: "14px",
              color: "#1e293b",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#f1f5f9")}
            onMouseLeave={(e) => (e.target.style.background = "none")}
          >
            Edit Profile
          </button>
          {user?.role === "doctor" && (
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/doctor/profile");
              }}
              style={{
                width: "100%",
                padding: "10px 16px",
                background: "none",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "14px",
                color: "#1e293b",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#f1f5f9")}
              onMouseLeave={(e) => (e.target.style.background = "none")}
            >
              Doctor Profile
            </button>
          )}
          {user?.role === "patient" && (
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/patient/doctors");
              }}
              style={{
                width: "100%",
                padding: "10px 16px",
                background: "none",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "14px",
                color: "#1e293b",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#f1f5f9")}
              onMouseLeave={(e) => (e.target.style.background = "none")}
            >
              Find Doctors
            </button>
          )}
          {user?.role === "admin" && (
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/admin");
              }}
              style={{
                width: "100%",
                padding: "10px 16px",
                background: "none",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "14px",
                color: "#1e293b",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#f1f5f9")}
              onMouseLeave={(e) => (e.target.style.background = "none")}
            >
              Admin Dashboard
            </button>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "10px 16px",
              background: "none",
              border: "none",
              textAlign: "left",
              cursor: "pointer",
              fontSize: "14px",
              color: "#ef4444",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#fee2e2")}
            onMouseLeave={(e) => (e.target.style.background = "none")}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}


