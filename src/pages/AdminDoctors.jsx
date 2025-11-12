import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig.js";
import { toast } from "react-toastify";
import "../auth.css";

export default function AdminDoctors() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/doctors", { params: { status } });
      setDoctors(res.data?.doctors || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const patch = async (id, patch) => {
    try {
      await api.patch(`/admin/doctors/${id}`, patch);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update doctor");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 1000, width: "100%" }}>
        <h2>Admin Doctors</h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <select value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
          <button onClick={load} disabled={loading}>{loading ? "Loading..." : "Filter"}</button>
        </div>
        <div>
          {doctors.map((d)=>(
            <div key={d._id} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr auto auto", gap: 8, alignItems: "center", padding: "8px 0", borderBottom: "1px solid #e2e8f0" }}>
              <div>{d.name}</div>
              <div style={{ color: "#64748b" }}>{d.email}</div>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="checkbox" checked={!!d.approved} onChange={(e)=>patch(d._id, { approved: e.target.checked })} /> Approved
                </label>
              </div>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="checkbox" checked={!!d.active} onChange={(e)=>patch(d._id, { active: e.target.checked })} /> Active
                </label>
              </div>
              <button onClick={()=>navigate(`/admin/doctors/${d._id}`)}>View Profile</button>
              <span style={{ color: d.profileCompleted ? "#16a34a" : "#ef4444" }}>{d.profileCompleted ? "Profile Complete" : "Incomplete"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


