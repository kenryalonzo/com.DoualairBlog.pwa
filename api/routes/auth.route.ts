import { Router } from "express";
import {
  changePassword,
  forgotPassword,
  googleAuth,
  refreshToken,
  resetPassword,
  signin,
  signout,
  signup,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  authLimiter,
  signupLimiter,
} from "../middleware/security.middleware.js";

const router = Router();

// Routes d'authentification
router.post("/signup", signupLimiter, signup);
router.post("/signin", authLimiter, signin);
router.post("/signout", signout);
router.post("/google", googleAuth);
router.post("/refresh", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/change-password", verifyToken, changePassword);

export default router;
