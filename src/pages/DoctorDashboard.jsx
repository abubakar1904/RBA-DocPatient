// src/pages/DoctorDashboard.jsx
import React from "react";
import "../auth.css";

const DoctorDashboard = () => {
  const doctor = JSON.parse(localStorage.getItem("user"));
  const avatar = doctor?.avatarUrl
    ? (doctor.avatarUrl.startsWith("http") ? doctor.avatarUrl : `http://localhost:5000${doctor.avatarUrl}`)
    : "";

  return (
    <div className="dashboard">
      <div className="dashboard-card">
        {avatar && (
          <img
            src={avatar}
            alt="avatar"
            style={{ width: 96, height: 96, borderRadius: 12, objectFit: "cover", marginBottom: 12 }}
          />
        )}
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
