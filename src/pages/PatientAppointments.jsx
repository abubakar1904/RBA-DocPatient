import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/authStore";
import ProfileDropdown from "../components/ProfileDropdown";
import "../auth.css";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
};

const formatTime = (timeStr) => {
  if (!timeStr) return "N/A";
  const [hours, minutes] = timeStr.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHours = ((hours + 11) % 12) + 1;
  return `${normalizedHours}:${minutes.toString().padStart(2, "0")} ${suffix}`;
};

const getStatusColor = (status) => {
  switch (status) {
    case "confirmed":
      return "#10b981";
    case "pending":
      return "#f59e0b";
    case "completed":
      return "#3b82f6";
    case "cancelled":
      return "#ef4444";
    default:
      return "#64748b";
  }
};

export default function PatientAppointments() {
  const { token, user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    if (!token) {
      console.log("No token found, cannot fetch appointments");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching appointments with token:", token.substring(0, 20) + "...");
      const res = await axios.get("http://localhost:5000/api/appointments/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Appointments response:", res.data);
      setAppointments(res.data?.appointments || []);
      if (res.data?.appointments?.length === 0) {
        console.log("No appointments found in response");
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
      console.error("Error response:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const upcomingAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return aptDate >= today && apt.status !== "cancelled";
  });

  const pastAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return aptDate < today || apt.status === "cancelled";
  });

  return (
    <div className="dashboard">
      <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
        <ProfileDropdown />
      </div>
      <div className="dashboard-card" style={{ maxWidth: "900px", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1>My Appointments</h1>
            <p style={{ color: "#64748b", margin: 0 }}>View and manage your appointments</p>
          </div>
          <button onClick={fetchAppointments} disabled={loading} style={{ padding: "0.5rem 1rem" }}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p>Loading appointments...</p>
        ) : (
          <>
            {upcomingAppointments.length > 0 && (
              <div style={{ marginBottom: "2rem" }}>
                <h2 style={{ marginBottom: "1rem", color: "#1e293b" }}>Upcoming Appointments</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {upcomingAppointments.map((apt) => (
                    <div
                      key={apt._id}
                      style={{
                        padding: "1.5rem",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        background: "#f8fafc",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "1rem" }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: "0 0 0.5rem 0", color: "#1e293b" }}>
                            Dr. {apt.doctor?.name || "Unknown Doctor"}
                          </h3>
                          <p style={{ margin: "0.25rem 0", color: "#64748b" }}>
                            <strong>Date:</strong> {formatDate(apt.date)}
                          </p>
                          <p style={{ margin: "0.25rem 0", color: "#64748b" }}>
                            <strong>Time:</strong> {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                          </p>
                          <p style={{ margin: "0.25rem 0", color: "#64748b" }}>
                            <strong>Reason:</strong> {apt.reason}
                          </p>
                          <p style={{ margin: "0.25rem 0", color: "#64748b" }}>
                            <strong>Fee:</strong> PKR {Number(apt.price || 0).toLocaleString("en-PK")}
                          </p>
                        </div>
                        <div>
                          <span
                            style={{
                              padding: "0.5rem 1rem",
                              borderRadius: "8px",
                              background: getStatusColor(apt.status),
                              color: "white",
                              fontSize: "0.85rem",
                              fontWeight: 500,
                              textTransform: "capitalize",
                            }}
                          >
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pastAppointments.length > 0 && (
              <div>
                <h2 style={{ marginBottom: "1rem", color: "#1e293b" }}>Past Appointments</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {pastAppointments.map((apt) => (
                    <div
                      key={apt._id}
                      style={{
                        padding: "1.5rem",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        background: "#f8fafc",
                        opacity: apt.status === "cancelled" ? 0.7 : 1,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "1rem" }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: "0 0 0.5rem 0", color: "#1e293b" }}>
                            Dr. {apt.doctor?.name || "Unknown Doctor"}
                          </h3>
                          <p style={{ margin: "0.25rem 0", color: "#64748b" }}>
                            <strong>Date:</strong> {formatDate(apt.date)}
                          </p>
                          <p style={{ margin: "0.25rem 0", color: "#64748b" }}>
                            <strong>Time:</strong> {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                          </p>
                          <p style={{ margin: "0.25rem 0", color: "#64748b" }}>
                            <strong>Reason:</strong> {apt.reason}
                          </p>
                          <p style={{ margin: "0.25rem 0", color: "#64748b" }}>
                            <strong>Fee:</strong> PKR {Number(apt.price || 0).toLocaleString("en-PK")}
                          </p>
                        </div>
                        <div>
                          <span
                            style={{
                              padding: "0.5rem 1rem",
                              borderRadius: "8px",
                              background: getStatusColor(apt.status),
                              color: "white",
                              fontSize: "0.85rem",
                              fontWeight: 500,
                              textTransform: "capitalize",
                            }}
                          >
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {appointments.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                <p style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>No appointments found</p>
                <p>Book your first appointment to get started!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

