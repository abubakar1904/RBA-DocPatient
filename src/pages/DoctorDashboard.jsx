import React from "react";
import { useAuthStore } from "../store/authStore";
import ProfileDropdown from "../components/ProfileDropdown";
import "../auth.css";

const DoctorDashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="dashboard">
      <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
        <ProfileDropdown />
      </div>
      <div className="dashboard-card">
        <h1>👨‍⚕️ Doctor Dashboard</h1>
        <p>Welcome, Dr. {user?.name || "User"}!</p>
        <p>Your email: {user?.email}</p>
        <p>Role: {user?.role}</p>
        {user?.phone && <p>Phone: {user.phone}</p>}
        {user?.bio && <p>Bio: {user.bio}</p>}

        {user?.doctorDetails && (
          <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
            <h3 style={{ marginBottom: "0.75rem" }}>Professional Details</h3>
            {user.doctorDetails.certificateNumber && (
              <p><strong>Certificate Number:</strong> {user.doctorDetails.certificateNumber}</p>
            )}
            {user.doctorDetails.qualifications && (
              <p><strong>Qualifications:</strong> {user.doctorDetails.qualifications}</p>
            )}
            {user.doctorDetails.categories?.length > 0 && (
              <p>
                <strong>Categories:</strong> {user.doctorDetails.categories.join(", ")}
              </p>
            )}
            {user.doctorDetails.specialities?.length > 0 && (
              <p>
                <strong>Specialities:</strong> {user.doctorDetails.specialities.join(", ")}
              </p>
            )}
            {user.doctorDetails.clinicName && (
              <p><strong>Clinic:</strong> {user.doctorDetails.clinicName}</p>
            )}
            {user.doctorDetails.clinicAddress && (
              <p><strong>Address:</strong> {user.doctorDetails.clinicAddress}</p>
            )}
            {user.doctorDetails.yearsOfExperience !== undefined && user.doctorDetails.yearsOfExperience !== null && (
              <p><strong>Experience:</strong> {user.doctorDetails.yearsOfExperience} years</p>
            )}
            {user.doctorDetails.consultationFee !== undefined && user.doctorDetails.consultationFee !== null && (
              <p><strong>Consultation Fee:</strong> PKR {user.doctorDetails.consultationFee}</p>
            )}
            {user.doctorDetails.availability && (
              <div style={{ marginTop: "1rem" }}>
                <strong>Availability:</strong>
                <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                  {user.doctorDetails.availability.days?.length > 0 && (
                    <li>Days: {user.doctorDetails.availability.days.join(", ")}</li>
                  )}
                  {user.doctorDetails.availability.startTime && user.doctorDetails.availability.endTime && (
                    <li>
                      Time: {user.doctorDetails.availability.startTime} - {user.doctorDetails.availability.endTime}
                    </li>
                  )}
                  {user.doctorDetails.availability.slotDuration && (
                    <li>Slot Duration: {user.doctorDetails.availability.slotDuration} minutes</li>
                  )}
                  {user.doctorDetails.availability.slotsPerDay && (
                    <li>Slots Per Day: {user.doctorDetails.availability.slotsPerDay}</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
