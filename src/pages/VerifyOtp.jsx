import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { validateEmail, validateOTP } from "../utils/validations";
import "../auth.css";

export default function VerifyOtp() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0); // seconds
  const [expiryLeft, setExpiryLeft] = useState(0); // seconds
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const timerRef = useRef(null);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!email) return;
    // read last sent timestamp
    let last = 0;
    try {
      const raw = localStorage.getItem(`otp_last_sent_${email}`);
      last = raw ? Number(raw) : 0;
    } catch {}
    if (!last) {
      // Auto-resend on first arrival if we have an email
      (async () => {
        await handleResendOtp(true);
      })();
      return;
    }
    const now = Date.now();
    const cooldownEnd = last + 60 * 1000; // 1 min
    const expiryEnd = last + 5 * 60 * 1000; // 5 min
    setCooldownLeft(Math.max(0, Math.ceil((cooldownEnd - now) / 1000)));
    setExpiryLeft(Math.max(0, Math.ceil((expiryEnd - now) / 1000)));

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const tnow = Date.now();
      setCooldownLeft((prev) => Math.max(0, Math.ceil((cooldownEnd - tnow) / 1000)));
      setExpiryLeft((prev) => Math.max(0, Math.ceil((expiryEnd - tnow) / 1000)));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [email]);

  const handleResendOtp = async (silent = false) => {
    if (!email || !validateEmail(email)) {
      if (!silent) toast.error("Please enter a valid email first");
      return;
    }

    try {
      setResending(true);
      const res = await axios.post("http://localhost:5000/api/auth/resend-otp", { email });
      if (!silent) toast.success(res.data.message || "OTP resent to email");
      // set last sent time and restart timers
      try {
        const now = Date.now();
        localStorage.setItem(`otp_last_sent_${email}`, String(now));
      } catch {}
      // re-run timer init by forcing email effect
      setEmail((prev) => prev);
    } catch (err) {
      if (!silent) toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email || !validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!validateOTP(otp)) {
      newErrors.otp = "Please enter a valid 6-digit OTP";
    }
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", { email, otp });
      toast.success(res.data.message || "Email verified successfully");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error verifying OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify OTP</h2>
        <p className="subtitle">Enter the code sent to your email</p>
        <form onSubmit={handleSubmit}>
          <label className="required-label">Email Address <span className="required-asterisk">*</span></label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: "" });
            }}
            className={errors.email ? "error-input" : ""}
            required
          />
          {errors.email && <span className="error-text">{errors.email}</span>}

          <label className="required-label">OTP <span className="required-asterisk">*</span></label>
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              if (errors.otp) setErrors({ ...errors, otp: "" });
            }}
            maxLength={6}
            className={errors.otp ? "error-input" : ""}
            required
          />
          {errors.otp && <span className="error-text">{errors.otp}</span>}

          <button type="submit" disabled={loading || expiryLeft === 0}>{loading ? "Verifying..." : expiryLeft === 0 ? "OTP Expired" : "Verify"}</button>
          <div style={{ marginTop: "0.75rem", color: "#64748b", fontSize: "0.9rem" }}>
            <div>OTP expires in: {Math.floor(expiryLeft/60)}:{String(expiryLeft%60).padStart(2,'0')}</div>
            <div>
              Resend available in: {cooldownLeft > 0 ? `${Math.floor(cooldownLeft/60)}:${String(cooldownLeft%60).padStart(2,'0')}` : "now"}
            </div>
          </div>
          
          <p className="switch" style={{ marginTop: "1rem" }}>
            Didn't receive OTP?{" "}
            <button
              type="button"
              onClick={() => handleResendOtp(false)}
              disabled={resending || cooldownLeft > 0}
              style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", textDecoration: "underline", padding: 0, fontSize: "inherit" }}
            >
              {resending ? "Resending..." : cooldownLeft > 0 ? "Wait to Resend" : "Resend OTP"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
