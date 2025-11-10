import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProfileSetup from "./pages/ProfileSetup";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleBasedRoute from "./components/RoleBasedRoute";
import AuthGuard from "./components/AuthGuard";
import DoctorProfile from "./pages/DoctorProfile.jsx";
import DoctorsDirectory from "./pages/DoctorsDirectory.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import HomeLayout from "./layout/homeLayout.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<HomeLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<AuthGuard><Signup /></AuthGuard>} />
          <Route path="/verify-otp" element={<AuthGuard><VerifyOtp /></AuthGuard>} />
          <Route path="/login" element={<AuthGuard><Login /></AuthGuard>} />
          <Route path="/forget" element={<AuthGuard><ForgotPassword /></AuthGuard>} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route
            path="/profile-setup"
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={["doctor","admin"]}>
                  <DoctorDashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/profile"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRole="doctor">
                  <DoctorProfile />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={["patient","admin"]}>
                  <PatientDashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/doctors"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRole="patient">
                  <DoctorsDirectory />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRole="admin">
                  <AdminDashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
    
}

export default App;
