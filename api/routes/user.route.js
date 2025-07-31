import express from "express";
import {
  test,
  getAllUsers,
  updateProfile,
  updatePassword,
  deleteAccount,
  getUserStats,
} from "../controllers/user.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// Route de test
router.get("/test", test);

// Routes protégées
router.get("/all", verifyToken, requireRole(["admin"]), getAllUsers);
router.put("/profile", verifyToken, updateProfile);
router.put("/password", verifyToken, updatePassword);
router.delete("/account", verifyToken, deleteAccount);
router.get("/stats", verifyToken, getUserStats);

export default router;
