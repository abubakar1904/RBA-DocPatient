import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosConfig.js";
import { toast } from "react-toastify";
import "../auth.css";

export default function AdminDoctorDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/doctors/${id}`);
        setDoctor(res.data?.doctor || null);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load doctor");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card"><p>Loading doctor...</p></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="auth-container">
        <div className="auth-card"><p>Doctor not found</p></div>
      </div>
    );
  }

  const d = doctor;
  const det = d.doctorDetails || {};
  const avail = det.availability || {};

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 900, width: "100%" }}>
        <h2>Doctor Profile</h2>
        <p className="subtitle">{d.name} · {d.email}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <h3>Account</h3>
            <p><strong>Status:</strong> {d.active ? "Active" : "Inactive"} · {d.approved ? "Approved" : "Not Approved"} · {d.verified ? "Verified" : "Unverified"}</p>
            <p><strong>Profile:</strong> {d.profileCompleted ? "Completed" : "Incomplete"}</p>
          </div>
          <div>
            <h3>Basics</h3>
            <p><strong>Qualifications:</strong> {det.qualifications || "—"}</p>
            <p><strong>Certificate:</strong> {det.certificateNumber || "—"}</p>
            <p><strong>Consultation Fee:</strong> {det.consultationFee ?? "—"}</p>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <h3>Categories & Specialities</h3>
          <p><strong>Categories:</strong> {(det.categories || []).join(", ") || "—"}</p>
          <p><strong>Specialities:</strong> {(det.specialities || []).join(", ") || "—"}</p>
        </div>
        <div style={{ marginTop: 16 }}>
          <h3>Clinic</h3>
          <p><strong>Name:</strong> {det.clinicName || "—"}</p>
          <p><strong>Address:</strong> {det.clinicAddress || "—"}</p>
        </div>
        <div style={{ marginTop: 16 }}>
          <h3>Availability</h3>
          <p><strong>Days:</strong> {(avail.days || []).join(", ") || "—"}</p>
          <p><strong>Time:</strong> {avail.startTime || "—"} - {avail.endTime || "—"}</p>
          <p><strong>Slot Duration:</strong> {avail.slotDuration ?? "—"} mins</p>
          <p><strong>Slots Per Day:</strong> {avail.slotsPerDay ?? "—"}</p>
        </div>
      </div>
    </div>
  );
}


