import { NextFunction, Response } from "express";
import User from "../models/user.model.js";
import { AuthRequest, MiddlewareFunction } from "../types/index.js";
import { createError } from "../utils/error.js";
import {
  extractTokenFromHeader,
  verifyAccessToken,
} from "../utils/token.utils.js";

// Middleware pour vérifier l'authentification
export const verifyToken: MiddlewareFunction = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Récupérer le token depuis les cookies ou les headers
    const token =
      req.cookies["access_token"] ||
      extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return next(createError(401, "Accès refusé. Token manquant"));
    }

    // Vérifier le token
    const decoded = verifyAccessToken(token);

    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(createError(404, "Utilisateur non trouvé"));
    }

    if (!user.isActive) {
      return next(createError(401, "Compte désactivé"));
    }

    // Ajouter l'utilisateur à la requête
    req.user = {
      id: (user._id as any).toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Token d'accès invalide")) {
        return next(createError(401, "Token invalide"));
      } else if (error.message.includes("expiré")) {
        return next(createError(401, "Token expiré"));
      }
    }
    next(createError(500, "Erreur d'authentification"));
  }
};

// Middleware optionnel pour récupérer l'utilisateur si connecté
export const optionalAuth: MiddlewareFunction = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies["access_token"] ||
      extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select("-password");

      if (user && user.isActive) {
        req.user = {
          id: (user._id as any).toString(),
          username: user.username,
          email: user.email,
          role: user.role,
        };
      }
    }
    next();
  } catch (error) {
    // En cas d'erreur, on continue sans authentification
    next();
  }
};

// Middleware pour vérifier les rôles
export const requireRole = (roles: string[]): MiddlewareFunction => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError(401, "Accès refusé. Authentification requise"));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError(403, "Accès refusé. Permissions insuffisantes"));
    }

    next();
  };
};

// Middleware pour vérifier si l'utilisateur est admin
export const requireAdmin: MiddlewareFunction = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  return requireRole(["admin"])(req, _res, next);
};

// Middleware pour vérifier si l'utilisateur est modérateur ou admin
export const requireModerator: MiddlewareFunction = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  return requireRole(["admin", "moderator"])(req, _res, next);
};

// Middleware pour vérifier la propriété de la ressource
export const requireOwnership = (
  resourceIdField: string = "id"
): MiddlewareFunction => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError(401, "Accès refusé. Authentification requise"));
    }

    const resourceId = req.params[resourceIdField] || req.body[resourceIdField];

    if (!resourceId) {
      return next(createError(400, "ID de ressource manquant"));
    }

    // Permettre l'accès si l'utilisateur est admin ou propriétaire de la ressource
    if (req.user.role === "admin" || req.user.id === resourceId) {
      return next();
    }

    return next(
      createError(
        403,
        "Accès refusé. Vous n'êtes pas propriétaire de cette ressource"
      )
    );
  };
};
