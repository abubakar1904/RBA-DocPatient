import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../auth.css";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setToken(params.get("token") || "");
  }, [params]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", { token, password });
      alert("Password reset. Please log in.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="subtitle">Enter a new password for your account</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
      </div>
    </div>
  );
}


