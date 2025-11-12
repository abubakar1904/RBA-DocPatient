import express from "express";
import { listUsers, updateUser, listDoctors, updateDoctor, getDoctor } from "../../controllers/admin/userAdminController.js";
import { verifyToken } from "../../middleware/auth.js";
import { authorizeRoles } from "../../middleware/role.js";

const router = express.Router();

router.use(verifyToken, authorizeRoles("admin"));

router.get("/users", listUsers);
router.patch("/users/:id", updateUser);

router.get("/doctors", listDoctors);
router.get("/doctors/:id", getDoctor);
router.patch("/doctors/:id", updateDoctor);

export default router;


