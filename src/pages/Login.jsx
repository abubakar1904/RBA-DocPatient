import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../auth.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      const role = res.data?.role || localStorage.getItem("role");
      if (role === "doctor") {
        navigate("/doctor", { replace: true });
      } else {
        // default to patient if role missing or unrecognized
        navigate("/patient", { replace: true });
      }
      // Hard-redirect fallback if SPA navigation is blocked
      setTimeout(() => {
        const pathname = role === "doctor" ? "/doctor" : "/patient";
        if (window.location.pathname !== pathname) {
          window.location.href = pathname;
        }
      }, 50);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

   return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to your account</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
        </form>

        <p className="switch">
          Dont have an account? <a href="/signup">Sign up</a>
        </p>
      </div>
    </div>
  );
}
