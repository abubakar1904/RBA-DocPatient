import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import { createAppointment, getBookedSlots, getAllAppointments, getMyAppointments } from "../controllers/appointmentController.js";

const router = express.Router();

router.get("/booked", getBookedSlots);
router.post("/", verifyToken, authorizeRoles("patient"), createAppointment);
router.get("/all", verifyToken, authorizeRoles("admin"), getAllAppointments);
router.get("/mine", verifyToken, getMyAppointments);

export default router;

