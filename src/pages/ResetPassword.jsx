import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSearchParams, useNavigate } from "react-router-dom";
import { validatePassword } from "../utils/validations";
import "../auth.css";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setToken(params.get("token") || "");
    if (!params.get("token")) {
      toast.error("Invalid reset token");
      setTimeout(() => navigate("/forget"), 2000);
    }
  }, [params, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (password !== confirm) {
      newErrors.confirm = "Passwords do not match";
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/auth/reset-password", { token, password });
      toast.success("Password reset successfully. Please log in.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="subtitle">Enter a new password for your account</p>
        <form onSubmit={handleSubmit}>
          <label className="required-label">New Password <span className="required-asterisk">*</span></label>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: "" });
            }}
            className={errors.password ? "error-input" : ""}
            required
          />
          {errors.password && <span className="error-text">{errors.password}</span>}

          <label className="required-label">Confirm Password <span className="required-asterisk">*</span></label>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              if (errors.confirm) setErrors({ ...errors, confirm: "" });
            }}
            className={errors.confirm ? "error-input" : ""}
            required
          />
          {errors.confirm && <span className="error-text">{errors.confirm}</span>}

          <button type="submit" disabled={loading || !token}>{loading ? "Resetting..." : "Reset Password"}</button>
        </form>
      </div>
    </div>
  );
}
