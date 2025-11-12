import express from "express";
import { listSpecialities, createSpeciality, updateSpeciality, deleteSpeciality } from "../../controllers/taxonomy/specialityAdminController.js";
import { verifyToken } from "../../middleware/auth.js";
import { authorizeRoles } from "../../middleware/role.js";

const router = express.Router();

router.use(verifyToken, authorizeRoles("admin"));

router.get("/specialities", listSpecialities);
router.post("/specialities", createSpeciality);
router.patch("/specialities/:id", updateSpeciality);
router.delete("/specialities/:id", deleteSpeciality);

export default router;


