import { useEffect, useState } from "react";
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

export default function DoctorBookings() {
  const { token, user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/appointments/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data?.appointments || []);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  const upcomingBookings = appointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return aptDate >= today && apt.status !== "cancelled";
  });

  const pastBookings = appointments.filter((apt) => {
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
        <h1>My Bookings</h1>
        <p style={{ color: "#64748b", marginBottom: "2rem" }}>View and manage your patient appointments</p>

        {loading ? (
          <p>Loading bookings...</p>
        ) : (
          <>
            {upcomingBookings.length > 0 && (
              <div style={{ marginBottom: "2rem" }}>
                <h2 style={{ marginBottom: "1rem", color: "#1e293b" }}>Upcoming Bookings</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {upcomingBookings.map((apt) => (
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
                            Patient: {apt.patient?.name || "Unknown Patient"}
                          </h3>
                          <p style={{ margin: "0.25rem 0", color: "#64748b" }}>
                            <strong>Email:</strong> {apt.patient?.email || "N/A"}
                          </p>
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
                            <strong>Age:</strong> {apt.age} | <strong>Gender:</strong> {apt.gender}
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

            {pastBookings.length > 0 && (
              <div>
                <h2 style={{ marginBottom: "1rem", color: "#1e293b" }}>Past Bookings</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {pastBookings.map((apt) => (
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
                            Patient: {apt.patient?.name || "Unknown Patient"}
                          </h3>
                          <p style={{ margin: "0.25rem 0", color: "#64748b" }}>
                            <strong>Email:</strong> {apt.patient?.email || "N/A"}
                          </p>
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
                            <strong>Age:</strong> {apt.age} | <strong>Gender:</strong> {apt.gender}
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
                <p style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>No bookings found</p>
                <p>You don't have any appointments scheduled yet.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


