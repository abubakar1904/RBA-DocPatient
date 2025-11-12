import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/authStore";
import "../auth.css";

export default function PaymentCancelled() {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    toast.error("Payment was cancelled. Your appointment was not booked.");
    // Redirect to doctors directory after 3 seconds
    setTimeout(() => {
      navigate("/patient/doctors");
    }, 3000);
  }, [token, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: "center", maxWidth: "500px" }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>❌</div>
        <h2>Payment Cancelled</h2>
        <p className="subtitle">Your payment was cancelled and the appointment was not booked.</p>
        <p style={{ color: "#64748b", marginTop: "1rem" }}>
          You will be redirected to the doctors directory shortly...
        </p>
        <button
          onClick={() => navigate("/patient/doctors")}
          style={{ marginTop: "1.5rem" }}
        >
          Book Another Appointment
        </button>
      </div>
    </div>
  );
}


