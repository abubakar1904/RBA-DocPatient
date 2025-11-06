import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { validateEmail } from "../utils/validations";
import "../auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !validateEmail(email)) {
      setErrors({ email: "Please enter a valid email" });
      toast.error("Please enter a valid email");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      toast.success("A reset link has been sent to your email");
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        {!sent && (
          <p className="subtitle">Enter your email to receive a reset link</p>
        )}
        {sent ? (
          <p className="subtitle">A reset link has been sent.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="required-label">Email Address <span className="required-asterisk">*</span></label>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              className={errors.email ? "error-input" : ""}
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
            <button type="submit" disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</button>
          </form>
        )}
        <p className="switch">Remembered it? <a href="/login">Back to Login</a></p>
      </div>
    </div>
  );
}
