import express from "express";
import { test } from "../controllers/user.controller.js";

const router = express.Router();

// Route de test
router.get('/test', test);

export default router;