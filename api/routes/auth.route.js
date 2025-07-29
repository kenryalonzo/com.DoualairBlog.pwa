import express from "express";
import {
  signup,
  signin,
  signout,
  refreshToken,
  getProfile,
  checkAuth,
  googleAuth, // Import the new controller function
} from "../controllers/auth.controller.js";
import { verifyToken, optionalAuth } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/security.middleware.js";

const router = express.Router();

// Routes publiques avec rate limiting
router.post("/signup", authLimiter, signup);
router.post("/signin", authLimiter, signin);
// Add the new route for Google authentication
router.post("/google", authLimiter, googleAuth);
router.post("/signout", signout);
router.post("/refresh", refreshToken);

// Routes protégées
router.get("/profile", verifyToken, getProfile);
router.get("/check", optionalAuth, checkAuth);

export default router;
