// src/pages/PatientDashboard.jsx
import React from "react";
import "../auth.css";

const PatientDashboard = () => {
  const patient = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="dashboard">
      <div className="dashboard-card">
        <h1>🧍‍♂️ Patient Dashboard</h1>
        <p>Welcome, {patient?.name || "User"}!</p>
        <p>Your email: {patient?.email}</p>
        <p>Role: {patient?.role}</p>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default PatientDashboard;
