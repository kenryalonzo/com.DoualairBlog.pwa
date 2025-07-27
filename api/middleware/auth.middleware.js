import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";

export const verifyToken = async (req, res, next) => {
  try {
    // Récupérer le token depuis les cookies ou les headers
    const token =
      req.cookies.access_token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(errorHandler(401, "Accès refusé. Token manquant"));
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(errorHandler(404, "Utilisateur non trouvé"));
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(errorHandler(401, "Token invalide"));
    } else if (error.name === "TokenExpiredError") {
      return next(errorHandler(401, "Token expiré"));
    }
    next(error);
  }
};

// Middleware optionnel pour récupérer l'utilisateur si connecté
export const optionalAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies.access_token || req.headers.authorization?.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // En cas d'erreur, on continue sans authentification
    next();
  }
};

// Middleware pour vérifier les rôles (optionnel pour l'avenir)
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(errorHandler(401, "Accès refusé. Authentification requise"));
    }

    if (!roles.includes(req.user.role)) {
      return next(errorHandler(403, "Accès refusé. Permissions insuffisantes"));
    }

    next();
  };
};
