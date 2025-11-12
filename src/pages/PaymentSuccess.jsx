import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/authStore";
import "../auth.css";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const confirm = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      if (!sessionId) {
        toast.error("Invalid payment session");
        navigate("/patient");
        return;
      }

      try {
        setLoading(true);
        await axios.post(
          "http://localhost:5000/api/appointments/confirm",
          { sessionId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Payment successful! Your appointment has been booked.");
        setTimeout(() => {
          navigate("/patient");
        }, 3000);
      } catch (err) {
        console.error("Error confirming appointment:", err);
        toast.error(err.response?.data?.message || "Could not confirm appointment");
        navigate("/patient");
      } finally {
        setLoading(false);
      }
    };

    confirm();
  }, [sessionId, token, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: "center", maxWidth: "500px" }}>
        {loading ? (
          <div>
            <h2>Processing...</h2>
            <p className="subtitle">Please wait while we confirm your payment.</p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
            <h2>Payment Successful!</h2>
            <p className="subtitle">Your appointment has been booked successfully.</p>
            <p style={{ color: "#64748b", marginTop: "1rem" }}>
              You will be redirected to your dashboard shortly...
            </p>
            <button
              onClick={() => navigate("/patient")}
              style={{ marginTop: "1.5rem" }}
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}


