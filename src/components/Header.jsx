import { Link, NavLink } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Header = () => {
  const { isAuthenticated, role } = useAuthStore();

  const navLinkClasses = ({ isActive }) =>
    `transition-colors hover:text-blue-200 ${isActive ? "text-blue-200" : "text-white"}`;

  return (
    <header className="bg-blue-600 text-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-semibold tracking-tight">
          RBA Care
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <NavLink to="/" className={navLinkClasses} end>
            Home
          </NavLink>

          {role === "patient" && (
            <NavLink to="/patient/doctors" className={navLinkClasses}>
              Find Doctors
            </NavLink>
          )}

          {!isAuthenticated && (
            <>
              <NavLink to="/login" className={navLinkClasses}>
                Login
              </NavLink>
              <NavLink to="/signup" className={navLinkClasses}>
                Sign Up
              </NavLink>
            </>
          )}

          {isAuthenticated && role === "doctor" && (
            <NavLink to="/doctor" className={navLinkClasses}>
              Dashboard
            </NavLink>
          )}
          {isAuthenticated && role === "patient" && (
            <NavLink to="/patient" className={navLinkClasses}>
              Dashboard
            </NavLink>
          )}
          {isAuthenticated && role === "admin" && (
            <NavLink to="/admin" className={navLinkClasses}>
              Admin
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
