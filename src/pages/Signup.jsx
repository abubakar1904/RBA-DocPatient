import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { validateEmail, validatePassword, validateName, validateOTP } from "../utils/validations";
import "../auth.css";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "patient" });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateSignupForm = () => {
    const newErrors = {};
    if (!validateName(form.name)) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(form.password)) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateSignupForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/signup", form);
      toast.success(res.data.message || "OTP sent to email");
      // Start resend cooldown and expiry timers (client-side reference)
      try {
        localStorage.setItem(`otp_last_sent_${form.email}`, String(Date.now()));
      } catch {}
      setOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResending(true);
      const res = await axios.post("http://localhost:5000/api/auth/resend-otp", { email: form.email });
      toast.success(res.data.message || "OTP resent to email");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateOTP(otp)) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setVerifying(true);
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email: form.email,
        otp,
      });
      toast.success(res.data.message || "Email verified successfully");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setVerifying(false);
    }
  };

  if (otpSent) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Verify Email</h2>
          <p className="subtitle">Enter the 6-digit code sent to {form.email}</p>
          <label className="required-label">OTP <span className="required-asterisk">*</span></label>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            maxLength={6}
            required
          />
          <button onClick={handleVerifyOtp} disabled={verifying}>{verifying ? "Verifying..." : "Verify"}</button>
          <p className="switch" style={{ marginTop: "1rem" }}>
            Didn't receive OTP?{" "}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending}
              style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", textDecoration: "underline", padding: 0, fontSize: "inherit" }}
            >
              {resending ? "Resending..." : "Resend OTP"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="subtitle">Sign up to get started</p>
        <form onSubmit={handleSignup}>
          <label className="required-label">Full Name <span className="required-asterisk">*</span></label>
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className={errors.name ? "error-input" : ""}
            required
          />
          {errors.name && <span className="error-text">{errors.name}</span>}

          <label className="required-label">Email Address <span className="required-asterisk">*</span></label>
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className={errors.email ? "error-input" : ""}
            required
          />
          {errors.email && <span className="error-text">{errors.email}</span>}

          <label className="required-label">Password <span className="required-asterisk">*</span></label>
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className={errors.password ? "error-input" : ""}
            required
          />
          {errors.password && <span className="error-text">{errors.password}</span>}

          <label className="required-label">Role <span className="required-asterisk">*</span></label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="doctor">Doctor</option>
            <option value="patient">Patient</option>
          </select>

          <button type="submit" disabled={loading}>{loading ? "Loading..." : "Sign Up"}</button>
        </form>
        <p className="switch">Already have an account? <a href="/login">Login</a></p>
      </div>
    </div>
  );
}
