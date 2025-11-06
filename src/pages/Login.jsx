import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/authStore";
import { validateEmail } from "../utils/validations";
import "../auth.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: loginStore } = useAuthStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      
      loginStore(res.data.token, res.data.user, res.data.role);
      toast.success(res.data.message || "Login successful!");
      
      const role = res.data?.role;
      const profileCompleted = Boolean(res.data?.user?.profileCompleted);
      
      if (!profileCompleted) {
        navigate("/profile-setup", { replace: true });
      } else if (role === "doctor") {
        navigate("/doctor", { replace: true });
      } else {
        navigate("/patient", { replace: true });
      }
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      if (err.response?.status === 403 && err.response?.data?.email) {
        toast.error(message);
        // Auto-redirect to OTP verification with email
        navigate(`/verify-otp?email=${encodeURIComponent(err.response.data.email)}`);
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to your account</p>

        <form onSubmit={handleLogin}>
          <label className="required-label">Email Address <span className="required-asterisk">*</span></label>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className={errors.email ? "error-input" : ""}
            required
          />
          {errors.email && <span className="error-text">{errors.email}</span>}

          <label className="required-label">Password <span className="required-asterisk">*</span></label>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className={errors.password ? "error-input" : ""}
            required
          />
          {errors.password && <span className="error-text">{errors.password}</span>}

          <button type="submit" disabled={loading}>{loading ? "Loading..." : "Login"}</button>
        </form>

        <p className="switch">
          Dont have an account? <a href="/signup">Sign up</a>
        </p>

        <p className="switch">
          Forgot Password? <a href="/forget">Reset Password</a>
        </p>
      </div>
    </div>
  );
}
