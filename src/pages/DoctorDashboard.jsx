// src/pages/DoctorDashboard.jsx
import React from "react";
import "../auth.css";

const DoctorDashboard = () => {
  const doctor = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="dashboard">
      <div className="dashboard-card">
        <h1>👨‍⚕️ Doctor Dashboard</h1>
        <p>Welcome, Dr. {doctor?.name || "User"}!</p>
        <p>Your email: {doctor?.email}</p>
        <p>Role: {doctor?.role}</p>

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

export default DoctorDashboard;
