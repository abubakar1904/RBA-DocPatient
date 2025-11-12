import express from "express";
import { getMeta } from "../../controllers/taxonomy/metaPublicController.js";

const router = express.Router();

router.get("/", getMeta);

export default router;


