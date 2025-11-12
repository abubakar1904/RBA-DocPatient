import express from "express";
import { getAvailability, updateAvailability } from "../../controllers/taxonomy/settingsAdminController.js";
import { verifyToken } from "../../middleware/auth.js";
import { authorizeRoles } from "../../middleware/role.js";

const router = express.Router();

router.use(verifyToken, authorizeRoles("admin"));

router.get("/availability", getAvailability);
router.put("/availability", updateAvailability);

export default router;


