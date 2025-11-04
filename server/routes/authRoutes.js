import express from "express";
import { signup, verifyOtp, login } from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);

// Protected example:
router.get("/doctor-dashboard", verifyToken, authorizeRoles("doctor"), (req, res) => {
  res.json({ message: "Welcome Doctor!" });
});

router.get("/patient-dashboard", verifyToken, authorizeRoles("patient"), (req, res) => {
  res.json({ message: "Welcome Patient!" });
});

export default router;
