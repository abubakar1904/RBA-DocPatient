import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import ProfileDropdown from "../components/ProfileDropdown";
import { useAuthStore } from "../store/authStore";
import "../auth.css";

const CATEGORY_OPTIONS = [
  "Primary Care",
  "Specialist",
  "Surgery",
  "Telemedicine",
  "Wellness",
];

const SPECIALITY_OPTIONS = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
  "Urology",
];

const DAY_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];


const DoctorCard = ({ doctor }) => (
  <div
    style={{
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "16px",
      background: "white",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <h3 style={{ margin: 0 }}>{doctor.name || "Unnamed Doctor"}</h3>
        <p style={{ margin: 0, color: "#475569", fontSize: "0.9rem" }}>{doctor.email}</p>
      </div>
      {doctor.consultationFee !== undefined && doctor.consultationFee !== null && (
        <span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "6px 10px", borderRadius: "20px", fontWeight: 600 }}>
          ₹{doctor.consultationFee}
        </span>
      )}
    </div>
    {doctor.qualifications && (
      <p style={{ marginTop: "10px", color: "#334155", fontSize: "0.95rem" }}>{doctor.qualifications}</p>
    )}
    {doctor.specialities?.length > 0 && (
      <p style={{ margin: "6px 0", fontSize: "0.85rem", color: "#64748b" }}>
        Specialities: {doctor.specialities.join(", ")}
      </p>
    )}
    {doctor.categories?.length > 0 && (
      <p style={{ margin: "6px 0", fontSize: "0.85rem", color: "#64748b" }}>
        Categories: {doctor.categories.join(", ")}
      </p>
    )}
    {doctor.clinicName && (
      <p style={{ margin: "6px 0", fontSize: "0.85rem", color: "#475569" }}>Clinic: {doctor.clinicName}</p>
    )}
    {doctor.clinicAddress && (
      <p style={{ margin: "2px 0", fontSize: "0.8rem", color: "#94a3b8" }}>{doctor.clinicAddress}</p>
    )}
  </div>
);

const PatientCard = ({ patient }) => (
  <div
    style={{
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "16px",
      background: "white",
    }}
  >
    <h3 style={{ margin: 0 }}>{patient.name || "Unnamed Patient"}</h3>
    <p style={{ margin: 0, color: "#475569", fontSize: "0.9rem" }}>{patient.email}</p>
    {patient.phone && (
      <p style={{ margin: "6px 0", fontSize: "0.85rem", color: "#475569" }}>Phone: {patient.phone}</p>
    )}
    {patient.bio && (
      <p style={{ margin: "6px 0", fontSize: "0.85rem", color: "#64748b" }}>{patient.bio}</p>
    )}
    <div style={{ marginTop: "8px", fontSize: "0.8rem", color: patient.profileCompleted ? "#16a34a" : "#ef4444" }}>
      Profile {patient.profileCompleted ? "completed" : "incomplete"}
    </div>
  </div>
);

export default function AdminDashboard() {
  const { token, user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [doctorData, setDoctorData] = useState({ doctors: [], specialities: [] });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpeciality, setSelectedSpeciality] = useState("All");
  const [activeTab, setActiveTab] = useState("doctors");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [doctorRes, patientRes] = await Promise.all([
          axios.get("http://localhost:5000/api/auth/doctors"),
          axios.get("http://localhost:5000/api/auth/patients", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setDoctorData({
          doctors: doctorRes.data?.doctors || [],
          specialities: ["All", ...(doctorRes.data?.specialities || [])],
        });
        setPatients(patientRes.data?.patients || []);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  // Sync active tab with route: /admin/doctors or /admin/patients
  useEffect(() => {
    if (location.pathname.endsWith("/patients")) {
      setActiveTab("patients");
    } else {
      setActiveTab("doctors");
    }
  }, [location.pathname]);

  const goDoctors = () => navigate("/admin/doctors");
  const goPatients = () => navigate("/admin/patients");

  const filteredDoctors = useMemo(() => {
    if (selectedSpeciality === "All") return doctorData.doctors;
    return doctorData.doctors.filter((doc) => doc.specialities?.includes(selectedSpeciality));
  }, [doctorData.doctors, selectedSpeciality]);

  if (user?.role !== "admin") {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Admin Dashboard</h2>
          <p>You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard" style={{ alignItems: "flex-start", paddingTop: "2rem" }}>
      <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
        <ProfileDropdown />
      </div>
      <div className="dashboard-card" style={{ width: "100%", maxWidth: "1200px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ marginBottom: "0.25rem" }}>Admin Control Center</h1>
            <p style={{ margin: 0, color: "#475569" }}>Manage doctors and patients from a single view.</p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={goDoctors}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                border: activeTab === "doctors" ? "1px solid #2563eb" : "1px solid #cbd5f5",
                background: activeTab === "doctors" ? "#2563eb" : "white",
                color: activeTab === "doctors" ? "white" : "#1e293b",
                cursor: "pointer",
              }}
            >
              See Doctors ({doctorData.doctors.length})
            </button>
            <button
              type="button"
              onClick={goPatients}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                border: activeTab === "patients" ? "1px solid #16a34a" : "1px solid #cbd5f5",
                background: activeTab === "patients" ? "#16a34a" : "white",
                color: activeTab === "patients" ? "white" : "#1e293b",
                cursor: "pointer",
              }}
            >
              See Patients ({patients.length})
            </button>
            <a
              href="/doctor"
              style={{ padding: "8px 16px", borderRadius: "999px", border: "1px solid #cbd5f5", textDecoration: "none", color: "#1e293b" }}
            >
              View Doctor Dashboard
            </a>
            <a
              href="/patient"
              style={{ padding: "8px 16px", borderRadius: "999px", border: "1px solid #cbd5f5", textDecoration: "none", color: "#1e293b" }}
            >
              View Patient Dashboard
            </a>
          </div>
        </div>

        {loading ? (
          <p style={{ marginTop: "1.5rem" }}>Loading data...</p>
        ) : (
          <>
            {activeTab === "doctors" && (
              <div style={{ marginTop: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <h2 style={{ margin: 0 }}>Doctors</h2>
                  <div>
                    <label style={{ fontSize: "0.85rem", color: "#64748b" }}>Filter by speciality</label>
                    <select
                      value={selectedSpeciality}
                      onChange={(e) => setSelectedSpeciality(e.target.value)}
                      style={{ marginLeft: "0.5rem", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5f5" }}
                    >
                      {doctorData.specialities.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {filteredDoctors.length === 0 ? (
                  <p style={{ marginTop: "1rem" }}>No doctors found for this speciality.</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginTop: "1.25rem" }}>
                    {filteredDoctors.map((doctor) => (
                      <DoctorCard key={doctor.id} doctor={doctor} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "patients" && (
              <div style={{ marginTop: "1.5rem" }}>
                <h2 style={{ marginBottom: "1rem" }}>Patients</h2>
                {patients.length === 0 ? (
                  <p>No patients found.</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
                    {patients.map((patient) => (
                      <PatientCard key={patient.id} patient={patient} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


