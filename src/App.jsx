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

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
              <RoleBasedRoute allowedRole="doctor">
                <DoctorDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRole="patient">
                <PatientDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
    
}

export default App;
