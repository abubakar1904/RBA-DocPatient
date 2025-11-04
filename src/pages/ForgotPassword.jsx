import { useState } from "react";
import axios from "axios";
import "../auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send reset link");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p className="subtitle">Enter your email to receive a reset link</p>
        {sent ? (
          <p className="subtitle">If the email exists, a reset link has been sent.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Send Reset Link</button>
          </form>
        )}
        <p className="switch">Remembered it? <a href="/login">Back to Login</a></p>
      </div>
    </div>
  );
}


