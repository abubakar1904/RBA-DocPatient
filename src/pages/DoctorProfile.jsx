import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

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

export default function DoctorProfile() {
  const navigate = useNavigate();
  const { token, user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    certificateNumber: "",
    qualifications: "",
    categories: ["Primary Care"],
    specialities: ["Cardiology"],
    clinicName: "",
    clinicAddress: "",
    yearsOfExperience: "",
    consultationFee: "",
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      startTime: "10:00",
      endTime: "14:00",
      slotDuration: "30",
      slotsPerDay: "8",
    },
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const d = user?.doctorDetails || {};
    const availability = d.availability || {};
    setForm((prev) => ({
      certificateNumber: d.certificateNumber || "",
      qualifications: d.qualifications || "",
      categories: d.categories?.length ? d.categories : prev.categories,
      specialities: d.specialities?.length ? d.specialities : prev.specialities,
      clinicName: d.clinicName || "",
      clinicAddress: d.clinicAddress || "",
      yearsOfExperience: d.yearsOfExperience ?? "",
      consultationFee: d.consultationFee ?? "",
      availability: {
        days: availability.days?.length ? availability.days : prev.availability.days,
        startTime: availability.startTime || prev.availability.startTime,
        endTime: availability.endTime || prev.availability.endTime,
        slotDuration: availability.slotDuration ?? prev.availability.slotDuration,
        slotsPerDay: availability.slotsPerDay ?? prev.availability.slotsPerDay,
      },
    }));
  }, [token, user, navigate]);

  const toggleListValue = (listName, value) => {
    setForm((prev) => {
      const current = new Set(prev[listName]);
      if (current.has(value)) current.delete(value);
      else current.add(value);
      return { ...prev, [listName]: Array.from(current) };
    });
  };

  const toggleDay = (day) => {
    setForm((prev) => {
      const current = new Set(prev.availability.days);
      if (current.has(day)) current.delete(day);
      else current.add(day);
      return {
        ...prev,
        availability: { ...prev.availability, days: Array.from(current).sort((a, b) => DAY_OPTIONS.indexOf(a) - DAY_OPTIONS.indexOf(b)) },
      };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvailabilityChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.availability.days.length === 0) {
      toast.error("Select at least one availability day");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        certificateNumber: form.certificateNumber,
        qualifications: form.qualifications,
        categories: form.categories,
        specialities: form.specialities,
        clinicName: form.clinicName,
        clinicAddress: form.clinicAddress,
        yearsOfExperience: form.yearsOfExperience,
        consultationFee: form.consultationFee,
        availability: {
          days: form.availability.days,
          startTime: form.availability.startTime,
          endTime: form.availability.endTime,
          slotDuration: form.availability.slotDuration,
          slotsPerDay: form.availability.slotsPerDay,
        },
      };
      const res = await axios.post("http://localhost:5000/api/auth/doctor-profile", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.user) updateUser(res.data.user);
      toast.success("Doctor profile saved");
      navigate("/doctor");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save doctor profile");
    } finally {
      setLoading(false);
    }
  };

  const availabilitySummary = useMemo(() => {
    const days = form.availability.days.join(", ");
    return `${days || "No days"} | ${form.availability.startTime || "--"} - ${form.availability.endTime || "--"} | ${form.availability.slotDuration || "--"} mins | ${form.availability.slotsPerDay || "--"} slots`;
  }, [form.availability]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Doctor Profile</h2>
        <p className="subtitle">Provide your professional details</p>
        <form onSubmit={handleSubmit}>
          <label className="required-label">Certificate Number <span className="required-asterisk">*</span></label>
          <input
            name="certificateNumber"
            placeholder="Medical Council Registration"
            value={form.certificateNumber}
            onChange={handleChange}
            required
          />

          <label className="required-label">Qualifications <span className="required-asterisk">*</span></label>
          <input
            name="qualifications"
            placeholder="e.g., MBBS, MD"
            value={form.qualifications}
            onChange={handleChange}
            required
          />

          <label>Categories</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {CATEGORY_OPTIONS.map((category) => (
              <label key={category} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <input
                  type="checkbox"
                  checked={form.categories.includes(category)}
                  onChange={() => toggleListValue("categories", category)}
                />
                {category}
              </label>
            ))}
          </div>

          <label className="required-label">Specialities <span className="required-asterisk">*</span></label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {SPECIALITY_OPTIONS.map((speciality) => (
              <label key={speciality} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <input
                  type="checkbox"
                  checked={form.specialities.includes(speciality)}
                  onChange={() => toggleListValue("specialities", speciality)}
                />
                {speciality}
              </label>
            ))}
          </div>

          <label>Clinic/Hospital Name</label>
          <input name="clinicName" placeholder="Clinic or Hospital" value={form.clinicName} onChange={handleChange} />

          <label>Clinic Address</label>
          <input name="clinicAddress" placeholder="Address" value={form.clinicAddress} onChange={handleChange} />

          <label>Years of Experience</label>
          <input
            name="yearsOfExperience"
            type="number"
            min="0"
            placeholder="e.g., 5"
            value={form.yearsOfExperience}
            onChange={handleChange}
          />

          <label className="required-label">Consultation Fee <span className="required-asterisk">*</span></label>
          <input
            name="consultationFee"
            type="number"
            min="0"
            placeholder="e.g., 1500"
            value={form.consultationFee}
            onChange={handleChange}
            required
          />

          <div style={{ marginTop: "1rem", padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
            <h4 style={{ marginTop: 0, marginBottom: "8px" }}>Availability</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {DAY_OPTIONS.map((day) => (
                <label key={day} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input type="checkbox" checked={form.availability.days.includes(day)} onChange={() => toggleDay(day)} />
                  {day}
                </label>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: "12px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "140px" }}>
                <label>Start Time</label>
                <input name="startTime" type="time" value={form.availability.startTime} onChange={handleAvailabilityChange} />
              </div>
              <div style={{ flex: 1, minWidth: "140px" }}>
                <label>End Time</label>
                <input name="endTime" type="time" value={form.availability.endTime} onChange={handleAvailabilityChange} />
              </div>
              <div style={{ flex: 1, minWidth: "140px" }}>
                <label>Slot Duration (minutes)</label>
                <input
                  name="slotDuration"
                  type="number"
                  min="5"
                  step="5"
                  value={form.availability.slotDuration}
                  onChange={handleAvailabilityChange}
                />
              </div>
              <div style={{ flex: 1, minWidth: "140px" }}>
                <label>Slots Per Day</label>
                <input
                  name="slotsPerDay"
                  type="number"
                  min="1"
                  value={form.availability.slotsPerDay}
                  onChange={handleAvailabilityChange}
                />
              </div>
            </div>
            <div style={{ marginTop: "8px", color: "#475569", fontSize: "0.9rem" }}>Summary: {availabilitySummary}</div>
          </div>

          <button type="submit" disabled={loading} style={{ marginTop: "1.5rem" }}>
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}


