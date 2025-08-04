import { NextFunction, Request, Response } from "express";
import User from "../models/user.model.js";
import { AuthRequest, ControllerFunction } from "../types/index.js";
import { createError } from "../utils/error.js";
import {
  clearAuthCookies,
  generateAuthTokens,
  setAuthCookies,
} from "../utils/token.utils.js";

// Inscription
export const signup: ControllerFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return next(createError(400, "Utilisateur déjà existant"));
    }

    // Créer le nouvel utilisateur
    const newUser = new User({
      username,
      email,
      password,
      firstName,
      lastName,
    });

    await newUser.save();

    // Générer les tokens
    const tokens = generateAuthTokens({
      id: (newUser._id as any).toString(),
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });

    // Définir les cookies
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    // Retourner la réponse
    // Log pour debug
    console.log("[signup] User data sent:", {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      photo: newUser.avatar || null,
      role: newUser.role,
    });
    res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès",
      data: {
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          photo: newUser.avatar || null,
          role: newUser.role,
        },
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Connexion
export const signin: ControllerFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return next(createError(404, "Utilisateur non trouvé"));
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(createError(401, "Mot de passe incorrect"));
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return next(createError(401, "Compte désactivé"));
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    await user.save();

    // Générer les tokens
    const tokens = generateAuthTokens({
      id: (user._id as any).toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    });

    // Définir les cookies
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    // Retourner la réponse
    // Log pour debug
    console.log("[signin] User data sent:", {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      photo: user.avatar || null,
      role: user.role,
    });
    res.status(200).json({
      success: true,
      message: "Connexion réussie",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          photo: user.avatar || null,
          role: user.role,
        },
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Déconnexion
export const signout: ControllerFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Nettoyer les cookies (même si pas de token valide)
    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: "Déconnexion réussie",
    });
  } catch (error) {
    next(error);
  }
};

// Rafraîchir le token
export const refreshToken: ControllerFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies["refresh_token"] || req.body.refreshToken;

    if (!refreshToken) {
      return next(createError(401, "Token de rafraîchissement manquant"));
    }

    // Vérifier le token de rafraîchissement
    const decoded = require("jsonwebtoken").verify(
      refreshToken,
      process.env["JWT_REFRESH_SECRET"]
    );

    // Récupérer l'utilisateur
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return next(createError(401, "Utilisateur non trouvé ou inactif"));
    }

    // Générer de nouveaux tokens
    const tokens = generateAuthTokens({
      id: (user._id as any).toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    });

    // Définir les nouveaux cookies
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.status(200).json({
      success: true,
      message: "Token rafraîchi avec succès",
      data: { tokens },
    });
  } catch (error) {
    next(createError(401, "Token de rafraîchissement invalide"));
  }
};

// Mot de passe oublié
export const forgotPassword: ControllerFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(createError(404, "Utilisateur non trouvé"));
    }

    // TODO: Implémenter l'envoi d'email de réinitialisation
    // Pour l'instant, on retourne juste un message de succès

    res.status(200).json({
      success: true,
      message: "Email de réinitialisation envoyé",
    });
  } catch (error) {
    next(error);
  }
};

// Réinitialiser le mot de passe
export const resetPassword: ControllerFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, newPassword } = req.body;

    // TODO: Implémenter la vérification du token et la réinitialisation
    // Pour l'instant, on retourne juste un message de succès

    res.status(200).json({
      success: true,
      message: "Mot de passe réinitialisé avec succès",
    });
  } catch (error) {
    next(error);
  }
};

// Changer le mot de passe
export const changePassword: ControllerFunction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(createError(401, "Utilisateur non authentifié"));
    }

    // Récupérer l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "Utilisateur non trouvé"));
    }

    // Vérifier l'ancien mot de passe
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return next(createError(401, "Mot de passe actuel incorrect"));
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Mot de passe changé avec succès",
    });
  } catch (error) {
    next(error);
  }
};

// Authentification Google
export const googleAuth: ControllerFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, photo } = req.body;
    console.log('[googleAuth] photo reçu du front:', photo);

    if (!email) {
      return next(
        createError(400, "Email requis pour l'authentification Google")
      );
    }

    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email });
    const firstName = name ? name.split(" ")[0] : "";
    const lastName = name ? name.split(" ").slice(1).join(" ") : "";

    if (!user) {
      user = new User({
        username: email.split("@")[0],
        email: email,
        provider: 'google',
        firstName: firstName,
        lastName: lastName,
        avatar: photo || null,
        isActive: true,
        lastLogin: new Date()
      });
      await user.save();
    } else {
      user.lastLogin = new Date();
      if (photo && photo !== user.avatar) {
        user.avatar = photo;
      }
      await user.save();
    }

    // Générer les tokens
    const tokens = generateAuthTokens({
      id: (user._id as any).toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    });

    // Définir les cookies
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    // Retourner la réponse
    res.status(200).json({
      success: true,
      message: "Authentification Google réussie",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          photo: user.avatar,
          role: user.role
        },
        tokens: tokens
      }
    });
  } catch (error) {
    next(error);
  }
};
