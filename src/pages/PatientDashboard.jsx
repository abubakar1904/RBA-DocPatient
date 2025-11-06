import React from "react";
import { useAuthStore } from "../store/authStore";
import ProfileDropdown from "../components/ProfileDropdown";
import "../auth.css";

const PatientDashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="dashboard">
      <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
        <ProfileDropdown />
      </div>
      <div className="dashboard-card">
        <h1>🧍‍♂️ Patient Dashboard</h1>
        <p>Welcome, {user?.name || "User"}!</p>
        <p>Your email: {user?.email}</p>
        <p>Role: {user?.role}</p>
        {user?.phone && <p>Phone: {user.phone}</p>}
        {user?.bio && <p>Bio: {user.bio}</p>}
      </div>
    </div>
  );
};

export default PatientDashboard;
