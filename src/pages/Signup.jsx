import { useState } from "react";
import axios from "axios";
import "../auth.css";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "patient" });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", form);
      alert(res.data.message);
      setOtpSent(true);
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email: form.email,
        otp,
      });
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
    }
  };

  if (otpSent) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Verify Email</h2>
          <p className="subtitle">Enter the 6-digit code sent to {form.email}</p>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />
          <button onClick={handleVerifyOtp}>Verify</button>
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
          <input name="name" placeholder="Full Name" onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="doctor">Doctor</option>
            <option value="patient">Patient</option>
          </select>
          <button type="submit">Sign Up</button>
        </form>
        <p className="switch">Already have an account? <a href="/login">Login</a></p>
      </div>
    </div>
  );
}
