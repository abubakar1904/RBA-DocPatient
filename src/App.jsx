import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Welcome to Role Based Authentication of Doctor and Patient</h1>} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forget" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />

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
