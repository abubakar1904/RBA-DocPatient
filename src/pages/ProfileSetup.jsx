import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../auth.css";

export default function ProfileSetup() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
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
      .catch(() => {});
  }, [navigate]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    setAvatar(file || null);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const form = new FormData();
    form.append("name", name);
    form.append("phone", phone);
    form.append("bio", bio);
    if (avatar) form.append("avatar", avatar);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/profile", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.user) localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate(role === "doctor" ? "/doctor" : "/patient");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Complete Your Profile</h2>
        <p className="subtitle">Add details and upload your profile photo</p>
        <form onSubmit={handleSubmit}>
          <input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input placeholder="Short Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          {preview && (
            <img src={preview} alt="preview" style={{ width: 96, height: 96, borderRadius: 12, objectFit: "cover", alignSelf: "center" }} />
          )}
          <input type="file" accept="image/*" onChange={handleFile} />
          <button type="submit">Save and Continue</button>
        </form>
      </div>
    </div>
  );
}


