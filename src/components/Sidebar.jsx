import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const baseLinks = [{ to: "/", label: "Home" }];

const doctorLinks = [
  { to: "/doctor", label: "Doctor Dashboard" },
  { to: "/doctor/profile", label: "Doctor Profile" },
];

const patientLinks = [
  { to: "/patient", label: "Patient Dashboard" },
];

const adminLinks = [
  { to: "/admin", label: "Admin" },
  { to: "/admin/users", label: "Admin Users" },
  { to: "/admin/doctors", label: "Admin Doctors" },
  { to: "/admin/taxonomy", label: "Admin Taxonomy" },
];

const Sidebar = () => {
  const { role, isAuthenticated } = useAuthStore();

  const navLinkClasses = ({ isActive }) =>
    `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
    }`;

  const roleLinks =
    role === "doctor"
      ? doctorLinks
      : role === "patient"
      ? patientLinks
      : role === "admin"
      ? adminLinks
      : [];

  const computedBase =
    role === "doctor" ? baseLinks : [...baseLinks, { to: "/patient/doctors", label: "Find Doctors" }];

  const linksToRender = [...computedBase, ...(isAuthenticated ? roleLinks : [])];

  if (linksToRender.length === 0) {
    return null;
  }

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex">
      <nav className="flex-1 space-y-6 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Navigation
          </p>
          <ul className="mt-3 space-y-1">
            {linksToRender.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} className={navLinkClasses} end>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;