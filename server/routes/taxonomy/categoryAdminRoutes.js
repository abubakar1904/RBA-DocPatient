import express from "express";
import { listCategories, createCategory, updateCategory, deleteCategory } from "../../controllers/taxonomy/categoryAdminController.js";
import { verifyToken } from "../../middleware/auth.js";
import { authorizeRoles } from "../../middleware/role.js";

const router = express.Router();

// All routes require admin
router.use(verifyToken, authorizeRoles("admin"));

router.get("/categories", listCategories);
router.post("/categories", createCategory);
router.patch("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

export default router;


