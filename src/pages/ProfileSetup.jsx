import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { validateName, validatePhone } from "../utils/validations";
import "../auth.css";

export default function ProfileSetup() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { token, updateUser } = useAuthStore();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    axios
      .get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const u = res.data.user || {};
        setName(u.name || "");
        setPhone(u.phone || "");
        setBio(u.bio || "");
        setPreview(u.avatarUrl ? `http://localhost:5000${u.avatarUrl}` : "");
      })
      .catch(() => {
        toast.error("Failed to load profile");
      });
  }, [navigate, token]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    setAvatar(file || null);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!validateName(name)) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (phone && !validatePhone(phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const form = new FormData();
    form.append("name", name);
    if (phone) form.append("phone", phone);
    if (bio) form.append("bio", bio);
    if (avatar) form.append("avatar", avatar);
    
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/profile", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.data?.user) {
        updateUser(res.data.user);
      }
      
      toast.success("Profile updated successfully");
      const role = useAuthStore.getState().role;
      setTimeout(() => {
        navigate(role === "doctor" ? "/doctor" : "/patient");
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Complete Your Profile</h2>
        <p className="subtitle">Add details and upload your profile photo</p>
        <form onSubmit={handleSubmit}>
          <label className="required-label">Full Name <span className="required-asterisk">*</span></label>
          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: "" });
            }}
            className={errors.name ? "error-input" : ""}
            required
          />
          {errors.name && <span className="error-text">{errors.name}</span>}

          <label>Phone</label>
          <input
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors({ ...errors, phone: "" });
            }}
            className={errors.phone ? "error-input" : ""}
          />
          {errors.phone && <span className="error-text">{errors.phone}</span>}

          <label>Short Bio</label>
          <input placeholder="Short Bio (optional)" value={bio} onChange={(e) => setBio(e.target.value)} />

          {preview && (
            <img src={preview} alt="preview" style={{ width: 96, height: 96, borderRadius: 12, objectFit: "cover", alignSelf: "center" }} />
          )}
          <input type="file" accept="image/*" onChange={handleFile} />

          <button type="submit" disabled={loading}>{loading ? "Saving..." : "Save and Continue"}</button>
        </form>
      </div>
    </div>
  );
}
