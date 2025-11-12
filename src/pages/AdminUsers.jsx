import { useEffect, useState } from "react";
import api from "../api/axiosConfig.js";
import { toast } from "react-toastify";
import "../auth.css";

export default function AdminUsers() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users", { params: { query, role } });
      setUsers(res.data?.users || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const patch = async (id, patch) => {
    try {
      await api.patch(`/admin/users/${id}`, patch);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 1000, width: "100%" }}>
        <h2>Admin Users</h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <input placeholder="Search name or email" value={query} onChange={(e)=>setQuery(e.target.value)} />
          <select value={role} onChange={(e)=>setRole(e.target.value)}>
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="patient">Patient</option>
          </select>
          <button onClick={load} disabled={loading}>{loading ? "Loading..." : "Search"}</button>
        </div>
        <div>
          {users.map((u)=>(
            <div key={u._id} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr auto", gap: 8, alignItems: "center", padding: "8px 0", borderBottom: "1px solid #e2e8f0" }}>
              <div>{u.name}</div>
              <div style={{ color: "#64748b" }}>{u.email}</div>
              <div>
                <select value={u.role} onChange={(e)=>patch(u._id, { role: e.target.value })}>
                  <option value="admin">admin</option>
                  <option value="doctor">doctor</option>
                  <option value="patient">patient</option>
                </select>
              </div>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="checkbox" checked={!!u.active} onChange={(e)=>patch(u._id, { active: e.target.checked })} /> Active
                </label>
              </div>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="checkbox" checked={!!u.approved} onChange={(e)=>patch(u._id, { approved: e.target.checked })} /> Approved
                </label>
              </div>
              <div style={{ color: u.verified ? "#16a34a" : "#ef4444" }}>{u.verified ? "Verified" : "Unverified"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


