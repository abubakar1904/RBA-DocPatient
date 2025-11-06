import express from "express";
import { signup, verifyOtp, login, forgotPassword, resetPassword, updateProfile, me, resendOtp } from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import { upload } from "../utils/upload.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", verifyToken, me);
router.post("/profile", verifyToken, upload.single("avatar"), updateProfile);

// Protected example:
router.get("/doctor-dashboard", verifyToken, authorizeRoles("doctor"), (req, res) => {
  res.json({ message: "Welcome Doctor!" });
});

router.get("/patient-dashboard", verifyToken, authorizeRoles("patient"), (req, res) => {
  res.json({ message: "Welcome Patient!" });
});

export default router;
