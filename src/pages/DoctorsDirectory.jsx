import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ProfileDropdown from "../components/ProfileDropdown";
import { useAuthStore } from "../store/authStore";
import "../auth.css";

const formatDateLabel = (date) => {
  const options = { weekday: "short", day: "numeric", month: "short" };
  return date.toLocaleDateString(undefined, options);
};

const formatHumanDate = (date) => {
  const options = { day: "numeric", month: "long", year: "numeric" };
  return date.toLocaleDateString(undefined, options);
};

const parseTime = (timeStr) => {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

const formatTime = (minutes) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const suffix = hrs >= 12 ? "PM" : "AM";
  const normalizedHours = ((hrs + 11) % 12) + 1;
  return `${normalizedHours}:${mins.toString().padStart(2, "0")} ${suffix}`;
};

const toTimeString = (minutes) => `${Math.floor(minutes / 60).toString().padStart(2, "0")}:${(minutes % 60)
  .toString()
  .padStart(2, "0")}`;

export default function DoctorsDirectory() {
  const { token, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState("All");
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isBookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({ reason: "", age: "", gender: "male" });
  const [submitting, setSubmitting] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/auth/doctors");
        setDoctors(res.data?.doctors || []);
        setSpecialities(["All", ...(res.data?.specialities || [])]);
        if (res.data?.doctors?.length) {
          setSelectedDoctorId(res.data.doctors[0].id);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const filteredDoctors = useMemo(() => {
    if (selectedSpeciality === "All") return doctors;
    return doctors.filter((doc) => doc.specialities?.includes(selectedSpeciality));
  }, [doctors, selectedSpeciality]);

  useEffect(() => {
    if (filteredDoctors.length === 0) {
      setSelectedDoctorId(null);
      setSelectedSlot(null);
    } else if (!filteredDoctors.some((doc) => doc.id === selectedDoctorId)) {
      setSelectedDoctorId(filteredDoctors[0].id);
      setSelectedSlot(null);
    }
  }, [filteredDoctors, selectedDoctorId]);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDoctorId || !selectedDate) {
        setBookedSlots([]);
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/appointments/booked", {
          params: { doctorId: selectedDoctorId, date: selectedDate },
        });
        setBookedSlots(res.data?.bookedSlots || []);
      } catch (err) {
        console.error("Failed to fetch booked slots:", err);
        setBookedSlots([]);
      }
    };

    fetchBookedSlots();
  }, [selectedDoctorId, selectedDate]);

  const selectedDoctor = useMemo(() => filteredDoctors.find((doc) => doc.id === selectedDoctorId) || null, [filteredDoctors, selectedDoctorId]);

  const upcomingDates = useMemo(() => {
    const dates = [];
    const start = new Date();
    for (let i = 0; i < 14; i += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  const selectedDateObj = useMemo(() => new Date(selectedDate), [selectedDate]);

  const dayOfWeek = useMemo(() => selectedDateObj.toLocaleDateString(undefined, { weekday: "long" }), [selectedDateObj]);

  const availableSlots = useMemo(() => {
    if (!selectedDoctor?.availability) return [];
    const { days = [], startTime, endTime, slotDuration, slotsPerDay } = selectedDoctor.availability;
    if (!days.includes(dayOfWeek)) return [];
    const startMinutes = parseTime(startTime);
    const endMinutes = parseTime(endTime);
    const duration = Number(slotDuration) || 30;
    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) return [];
    const maxSlots = Number(slotsPerDay) || 8;
    const slots = [];
    const todayIso = new Date().toISOString().split("T")[0];
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const isToday = selectedDate === todayIso;

    for (let count = 0, current = startMinutes; current < endMinutes && count < maxSlots; current += duration, count += 1) {
      if (isToday && current <= nowMinutes) {
        continue;
      }
      const slotTime = toTimeString(current);
      if (bookedSlots.includes(slotTime)) {
        continue;
      }
      slots.push({
        label: formatTime(current),
        value: slotTime,
        endTime: toTimeString(Math.min(current + duration, endMinutes)),
      });
    }
    return slots;
  }, [selectedDoctor, dayOfWeek, selectedDate, bookedSlots]);

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setBookingForm((prev) => ({ ...prev, reason: prev.reason, age: prev.age }));
    setBookingModalOpen(true);
  };

  const closeModal = () => {
    setBookingModalOpen(false);
    setSubmitting(false);
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedSlot) return;
    if (!bookingForm.reason?.trim()) {
      toast.error("Please provide a reason for the appointment");
      return;
    }
    if (!bookingForm.age) {
      toast.error("Please provide age");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(
        "http://localhost:5000/api/appointments",
        {
          doctorId: selectedDoctor.id,
          date: selectedDate,
          startTime: selectedSlot.value,
          reason: bookingForm.reason,
          age: Number(bookingForm.age),
          gender: bookingForm.gender,
          price: selectedDoctor.consultationFee,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const checkoutUrl = res.data?.url;
      if (!checkoutUrl) {
        toast.error("Failed to initiate payment session");
        return;
      }

      toast.success("Redirecting to payment...");
      // Close modal before redirect
      setBookingModalOpen(false);
      setSelectedSlot(null);
      setBookingForm({ reason: "", age: "", gender: "male" });

      window.location.href = checkoutUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create appointment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token || user?.role !== "patient") {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Doctors Directory</h2>
          <p>You need to be logged in as a patient to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="directory-wrapper">
      <div className="directory-card">
        <div className="directory-header">
          <div>
            <h1>Doctors Directory</h1>
            <p style={{ margin: 0, color: "#475569" }}>Browse specialists and book appointments.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div className="directory-filter">
              <label>Filter by speciality</label>
              <select value={selectedSpeciality} onChange={(e) => setSelectedSpeciality(e.target.value)}>
                {specialities.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
            <ProfileDropdown />
          </div>
        </div>

        {loading ? (
          <p style={{ marginTop: "1.5rem" }}>Loading doctors...</p>
        ) : filteredDoctors.length === 0 ? (
          <p style={{ marginTop: "1.5rem" }}>No doctors found for this speciality.</p>
        ) : (
          <div className="directory-grid">
            {filteredDoctors.map((doc) => {
              const isActive = doc.id === selectedDoctorId;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoctorId(doc.id)}
                  className={`doctor-card${isActive ? " doctor-card--active" : ""}`}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div className="doctor-card__avatar">
                      {doc.name?.charAt(0)?.toUpperCase() || "D"}
                    </div>
                    <div>
                      <h3 style={{ margin: 0 }}>{doc.name}</h3>
                      <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>{doc.qualifications}</p>
                    </div>
                  </div>
                  <p style={{ marginTop: "12px", color: "#334155", fontSize: "0.93rem" }}>
                    {doc.specialities?.length ? doc.specialities.join(", ") : "Speciality not set"}
                  </p>
                  {doc.clinicName && (
                    <p style={{ margin: "4px 0", color: "#475569", fontSize: "0.85rem" }}>Clinic: {doc.clinicName}</p>
                  )}
                  {doc.consultationFee !== undefined && doc.consultationFee !== null && (
                    <p className="doctor-card__fee">
                      Fee:
                      <span>
                        Rs.&nbsp;{Number(doc.consultationFee).toLocaleString("en-PK")} PKR
                      </span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {selectedDoctor && (
          <div className="directory-divider">
            <h2 style={{ marginBottom: "0.35rem" }}>Book appointment with {selectedDoctor.name}</h2>
            <p style={{ marginTop: 0, color: "#475569" }}>Select a date to view available slots.</p>

            <div className="directory-scheduler">
              <div style={{ flex: "1 1 320px" }}>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ padding: "0.65rem 0.75rem", borderRadius: "12px", border: "1px solid #d0d8f5", width: "100%" }}
                />
                <div className="directory-calendar-grid">
                  {upcomingDates.map((date) => {
                    const iso = date.toISOString().split("T")[0];
                    const isSelected = iso === selectedDate;
                    return (
                      <button
                        key={iso}
                        type="button"
                        onClick={() => setSelectedDate(iso)}
                        className={`directory-calendar-button${isSelected ? " directory-calendar-button--active" : ""}`}
                      >
                        <div style={{ fontWeight: 600 }}>{date.toLocaleDateString(undefined, { weekday: "short" })}</div>
                        <div style={{ fontSize: "0.85rem" }}>{date.getDate()}</div>
                        <div style={{ fontSize: "0.75rem" }}>{date.toLocaleDateString(undefined, { month: "short" })}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ flex: "1 1 320px" }}>
                <h3 style={{ marginTop: 0 }}>Available Slots on {formatHumanDate(selectedDateObj)}</h3>
                {selectedDoctor.availability?.days?.includes(dayOfWeek) ? (
                  availableSlots.length > 0 ? (
                    <div className="directory-slots-grid">
                      {availableSlots.map((slot) => {
                        const isSelected = slot.value === selectedSlot?.value;
                        return (
                          <button
                            key={slot.value}
                            type="button"
                            onClick={() => handleSelectSlot(slot)}
                            className={`directory-slot-button${isSelected ? " directory-slot-button--active" : ""}`}
                          >
                            {slot.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ color: "#ef4444" }}>No available slots for the selected date.</p>
                  )
                ) : (
                  <p style={{ color: "#ef4444" }}>Doctor is not available on {dayOfWeek}. Choose another day.</p>
                )}
                {selectedSlot && (
                  <div className="directory-selection-banner">
                    Selected slot: <strong>{selectedSlot.label}</strong> on <strong>{formatHumanDate(selectedDateObj)}</strong>. Proceed to confirm the booking.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {isBookingModalOpen && selectedSlot && (
        <div className="booking-modal__overlay">
          <div className="booking-modal__card">
            <h3 className="booking-modal__header">Confirm Appointment</h3>
            <p className="booking-modal__subtitle">
              {selectedDoctor?.name} • {formatHumanDate(selectedDateObj)} • {selectedSlot.label}
            </p>
            <form onSubmit={handleSubmitAppointment} className="booking-modal__form">
              <div>
                <label className="text-sm font-medium" style={{ color: "#475569" }}>Reason for visit</label>
                <textarea
                  name="reason"
                  rows={3}
                  value={bookingForm.reason}
                  onChange={handleBookingChange}
                  style={{ width: "100%", borderRadius: "12px", border: "1px solid #d0d8f5", padding: "0.75rem", fontSize: "0.95rem" }}
                  placeholder="Describe symptoms or purpose"
                  required
                />
              </div>
              <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
                <div>
                  <label className="text-sm font-medium" style={{ color: "#475569" }}>Age</label>
                  <input
                    type="number"
                    name="age"
                    min={0}
                    value={bookingForm.age}
                    onChange={handleBookingChange}
                    style={{ width: "100%", borderRadius: "12px", border: "1px solid #d0d8f5", padding: "0.75rem", fontSize: "0.95rem" }}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium" style={{ color: "#475569" }}>Gender</label>
                  <select
                    name="gender"
                    value={bookingForm.gender}
                    onChange={handleBookingChange}
                    style={{ width: "100%", borderRadius: "12px", border: "1px solid #d0d8f5", padding: "0.75rem", fontSize: "0.95rem" }}
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", borderRadius: "12px", padding: "0.75rem 1rem", fontSize: "0.95rem" }}>
                <span style={{ color: "#64748b" }}>Consultation Fee</span>
                <strong style={{ color: "#0f172a" }}>Rs.&nbsp;{Number(selectedDoctor?.consultationFee ?? 0).toLocaleString("en-PK")} PKR</strong>
              </div>
              <div className="booking-modal__footer">
                <button
                  type="button"
                  onClick={closeModal}
                  className="booking-modal__cancel"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="booking-modal__confirm"
                  disabled={submitting}
                >
                  {submitting ? "Booking..." : "Confirm Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



