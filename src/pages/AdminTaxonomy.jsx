import { useEffect, useState } from "react";
import api from "../api/axiosConfig.js";
import { toast } from "react-toastify";
import "../auth.css";

export default function AdminTaxonomy() {
  const [tab, setTab] = useState("categories"); // categories | specialities | availability
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [availability, setAvailability] = useState({ startTime: "09:00", endTime: "17:00", slotDuration: 30, allowedDays: ["Monday","Tuesday","Wednesday","Thursday","Friday"] });

  const [catForm, setCatForm] = useState({ name: "", slug: "", sortOrder: 0, active: true });
  const [specForm, setSpecForm] = useState({ name: "", slug: "", sortOrder: 0, active: true });

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, specRes, availRes] = await Promise.all([
        api.get("/admin/meta/categories?includeInactive=true"),
        api.get("/admin/meta/specialities?includeInactive=true"),
        api.get("/admin/meta/availability"),
      ]);
      setCategories(catRes.data?.categories || []);
      setSpecialities(specRes.data?.specialities || []);
      if (availRes.data?.availability) setAvailability(availRes.data.availability);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load taxonomy");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const slugify = (s) =>
    String(s || "")
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const createCategory = async (e) => {
    e.preventDefault();
    try {
      const body = { ...catForm, slug: catForm.slug || slugify(catForm.name) };
      await api.post("/admin/meta/categories", body);
      toast.success("Category created");
      setCatForm({ name: "", slug: "", sortOrder: 0, active: true });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category");
    }
  };

  const createSpeciality = async (e) => {
    e.preventDefault();
    try {
      const body = { ...specForm, slug: specForm.slug || slugify(specForm.name) };
      await api.post("/admin/meta/specialities", body);
      toast.success("Speciality created");
      setSpecForm({ name: "", slug: "", sortOrder: 0, active: true });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create speciality");
    }
  };

  const patchCategory = async (id, patch) => {
    try {
      await api.patch(`/admin/meta/categories/${id}`, patch);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update category");
    }
  };
  const patchSpeciality = async (id, patch) => {
    try {
      await api.patch(`/admin/meta/specialities/${id}`, patch);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update speciality");
    }
  };
  const deleteCategory = async (id) => {
    try {
      await api.delete(`/admin/meta/categories/${id}`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    }
  };
  const deleteSpeciality = async (id) => {
    try {
      await api.delete(`/admin/meta/specialities/${id}`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete speciality");
    }
  };

  const saveAvailability = async (e) => {
    e.preventDefault();
    try {
      await api.put("/admin/meta/availability", availability);
      toast.success("Availability defaults saved");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save availability");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 900, width: "100%" }}>
        <h2>Admin Taxonomy</h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button onClick={() => setTab("categories")} disabled={tab==="categories"}>Categories</button>
          <button onClick={() => setTab("specialities")} disabled={tab==="specialities"}>Specialities</button>
          <button onClick={() => setTab("availability")} disabled={tab==="availability"}>Availability</button>
          <button onClick={loadData} disabled={loading}>{loading ? "Refreshing..." : "Refresh"}</button>
        </div>

        {tab === "categories" && (
          <>
            <form onSubmit={createCategory} style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr 1fr auto" }}>
              <input placeholder="Name" value={catForm.name} onChange={(e)=>setCatForm({...catForm, name: e.target.value})} required />
              <input placeholder="Slug (optional)" value={catForm.slug} onChange={(e)=>setCatForm({...catForm, slug: e.target.value})} />
              <input type="number" placeholder="Sort Order" value={catForm.sortOrder} onChange={(e)=>setCatForm({...catForm, sortOrder: Number(e.target.value)})} />
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="checkbox" checked={catForm.active} onChange={(e)=>setCatForm({...catForm, active: e.target.checked})} /> Active
              </label>
              <button type="submit">Add</button>
            </form>
            <div style={{ marginTop: 16 }}>
              {categories.map((c)=>(
                <div key={c._id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto auto", gap: 8, alignItems: "center", padding: "8px 0", borderBottom: "1px solid #e2e8f0" }}>
                  <div>{c.name}</div>
                  <div style={{ color: "#64748b" }}>{c.slug}</div>
                  <div>
                    <input type="number" value={c.sortOrder ?? 0} onChange={(e)=>patchCategory(c._id, { sortOrder: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input type="checkbox" checked={!!c.active} onChange={(e)=>patchCategory(c._id, { active: e.target.checked })} /> Active
                    </label>
                  </div>
                  <button onClick={()=>patchCategory(c._id, { name: prompt("New name", c.name) || c.name, slug: slugify(prompt("Slug (optional)", c.slug) || c.slug) })}>Edit</button>
                  <button onClick={()=>deleteCategory(c._id)} style={{ color: "#ef4444" }}>Delete</button>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "specialities" && (
          <>
            <form onSubmit={createSpeciality} style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr 1fr auto" }}>
              <input placeholder="Name" value={specForm.name} onChange={(e)=>setSpecForm({...specForm, name: e.target.value})} required />
              <input placeholder="Slug (optional)" value={specForm.slug} onChange={(e)=>setSpecForm({...specForm, slug: e.target.value})} />
              <input type="number" placeholder="Sort Order" value={specForm.sortOrder} onChange={(e)=>setSpecForm({...specForm, sortOrder: Number(e.target.value)})} />
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="checkbox" checked={specForm.active} onChange={(e)=>setSpecForm({...specForm, active: e.target.checked})} /> Active
              </label>
              <button type="submit">Add</button>
            </form>
            <div style={{ marginTop: 16 }}>
              {specialities.map((s)=>(
                <div key={s._id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto auto", gap: 8, alignItems: "center", padding: "8px 0", borderBottom: "1px solid #e2e8f0" }}>
                  <div>{s.name}</div>
                  <div style={{ color: "#64748b" }}>{s.slug}</div>
                  <div>
                    <input type="number" value={s.sortOrder ?? 0} onChange={(e)=>patchSpeciality(s._id, { sortOrder: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input type="checkbox" checked={!!s.active} onChange={(e)=>patchSpeciality(s._id, { active: e.target.checked })} /> Active
                    </label>
                  </div>
                  <button onClick={()=>patchSpeciality(s._id, { name: prompt("New name", s.name) || s.name, slug: slugify(prompt("Slug (optional)", s.slug) || s.slug) })}>Edit</button>
                  <button onClick={()=>deleteSpeciality(s._id)} style={{ color: "#ef4444" }}>Delete</button>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "availability" && (
          <form onSubmit={saveAvailability} style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div>
                <label>Start Time</label>
                <input type="time" value={availability.startTime} onChange={(e)=>setAvailability({...availability, startTime: e.target.value})} />
              </div>
              <div>
                <label>End Time</label>
                <input type="time" value={availability.endTime} onChange={(e)=>setAvailability({...availability, endTime: e.target.value})} />
              </div>
              <div>
                <label>Slot Duration (min)</label>
                <input type="number" min={5} step={5} value={availability.slotDuration} onChange={(e)=>setAvailability({...availability, slotDuration: Number(e.target.value)})} />
              </div>
            </div>
            <div>
              <label>Allowed Days (comma separated)</label>
              <input
                placeholder="Monday,Tuesday,Wednesday,Thursday,Friday"
                value={(availability.allowedDays || []).join(",")}
                onChange={(e)=>setAvailability({...availability, allowedDays: e.target.value.split(",").map(d=>d.trim()).filter(Boolean)})}
              />
            </div>
            <button type="submit">Save Availability</button>
          </form>
        )}
      </div>
    </div>
  );
}


