import { Router } from "express";
import {
  signin,
  signup,
  signout,
  google,
  verifyToken,
  refreshToken,
} from "../controllers/auth.controller.js";
import { authLimiter, signupLimiter } from "../middleware/security.middleware.js";

const router = Router();

// Routes d'authentification avec rate limiting
router.post("/signup", signupLimiter, signup);
router.post("/signin", authLimiter, signin);

// Nouvelles routes unifiées
router.post("/login", authLimiter, signin); // Alias pour signin
router.post("/google", authLimiter, google); // OAuth Google

// Routes de déconnexion et gestion des tokens
router.post("/signout", signout);
router.post("/logout", signout); // Alias pour signout
router.post("/refresh", refreshToken);
router.get("/verify", verifyToken);

export default router;
