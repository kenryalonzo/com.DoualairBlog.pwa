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

    // Vérifier si c'est un admin (credentials depuis .env)
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email === adminEmail && password === adminPassword) {
      console.log("[signin] Admin login detected");

      // Générer les tokens pour l'admin
      const adminTokens = generateAuthTokens({
        id: "admin",
        username: "Administrator",
        email: adminEmail,
        role: "admin",
      });

      // Définir les cookies pour l'admin
      setAuthCookies(res, adminTokens.accessToken, adminTokens.refreshToken);

      // Retourner la réponse admin
      return res.status(200).json({
        success: true,
        message: "Connexion administrateur réussie",
        user: {
          id: "admin",
          username: "Administrator",
          email: adminEmail,
          firstName: "Admin",
          lastName: "User",
          role: "admin",
          avatar: null,
        },
        token: adminTokens.accessToken,
      });
    }

    // Sinon, vérifier si l'utilisateur existe en base
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

// Vérifier l'authentification
export const checkAuth: ControllerFunction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(createError(401, "Utilisateur non authentifié"));
    }

    const user = await User.findById(req.user.id).select(
      "-password -refreshTokens"
    );
    if (!user) {
      return next(createError(404, "Utilisateur non trouvé"));
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          photo: user.avatar,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir le profil utilisateur
export const getProfile: ControllerFunction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(createError(401, "Utilisateur non authentifié"));
    }

    const user = await User.findById(req.user.id).select(
      "-password -refreshTokens"
    );
    if (!user) {
      return next(createError(404, "Utilisateur non trouvé"));
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          photo: user.avatar,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Authentification Google avec Firebase ID Token
export const google: ControllerFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return next(createError(400, "Token Firebase requis"));
    }

    // Ici, en production, vous devriez vérifier le token Firebase
    // Pour l'instant, nous simulons la validation
    // const decodedToken = await admin.auth().verifyIdToken(idToken);
    // Pour le développement, nous utilisons une simulation
    
    // Simulation de décodage du token Firebase
    let decodedToken: any;
    try {
      // En production, utilisez Firebase Admin SDK
      // Pour le développement, simulons la réponse
      const tokenPayload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
      decodedToken = {
        email: tokenPayload.email || 'test@google.com',
        name: tokenPayload.name || 'Google User',
        picture: tokenPayload.picture || null,
        uid: tokenPayload.sub || 'google_' + Date.now()
      };
    } catch (error) {
      return next(createError(401, "Token Firebase invalide"));
    }

    const { email, name, picture } = decodedToken;

    // Vérifier si c'est l'email admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (email === adminEmail) {
      console.log("[google] Admin login via Google detected");

      // Générer les tokens pour l'admin
      const adminTokens = generateAuthTokens({
        id: "admin_google",
        username: "Administrator",
        email: adminEmail,
        role: "admin",
      });

      // Définir les cookies pour l'admin
      setAuthCookies(res, adminTokens.accessToken, adminTokens.refreshToken);

      return res.status(200).json({
        success: true,
        message: "Connexion administrateur Google réussie",
        user: {
          id: "admin_google",
          username: "Administrator",
          email: adminEmail,
          firstName: "Admin",
          lastName: "User",
          role: "admin",
          profilePicture: picture,
        },
      });
    }

    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email });

    if (user) {
      // Utilisateur existant
      // Mettre à jour la photo si elle n'existe pas
      if (!user.avatar && picture) {
        user.avatar = picture;
        await user.save();
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

      res.status(200).json({
        success: true,
        message: "Connexion Google réussie",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profilePicture: user.avatar || picture,
        },
      });
    } else {
      // Nouvel utilisateur
      const nameParts = (name || 'Google User').split(' ');
      const firstName = nameParts[0] || 'Google';
      const lastName = nameParts.slice(1).join(' ') || 'User';
      
      // Générer un nom d'utilisateur unique
      const baseUsername = firstName.toLowerCase() + lastName.toLowerCase().replace(/\s+/g, '');
      let username = baseUsername;
      let counter = 1;
      
      // Vérifier l'unicité du nom d'utilisateur
      while (await User.findOne({ username })) {
        username = baseUsername + counter;
        counter++;
      }

      // Générer un mot de passe temporaire
      const generatedPassword = Math.random().toString(36).slice(-12) + 'A1!';

      const newUser = new User({
        username,
        email,
        password: generatedPassword,
        firstName,
        lastName,
        avatar: picture,
        isEmailVerified: true, // Google emails sont vérifiés
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

      res.status(201).json({
        success: true,
        message: "Compte Google créé et connexion réussie",
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          profilePicture: newUser.avatar,
        },
      });
    }
  } catch (error) {
    console.error("[google] Error:", error);
    next(createError(500, "Erreur lors de l'authentification Google"));
  }
};

// Vérification du token
export const verifyToken: ControllerFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies["access_token"] || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(createError(401, "Token d'accès manquant"));
    }

    // Vérifier le token
    const decoded = require("jsonwebtoken").verify(token, process.env.JWT_SECRET);

    // Si c'est un admin, retourner les données admin
    if (decoded.id === "admin" || decoded.id === "admin_google") {
      return res.status(200).json({
        success: true,
        message: "Token valide",
        user: {
          id: decoded.id,
          username: "Administrator",
          email: process.env.ADMIN_EMAIL,
          firstName: "Admin",
          lastName: "User",
          role: "admin",
          profilePicture: null,
        },
      });
    }

    // Récupérer l'utilisateur normal
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return next(createError(401, "Utilisateur non trouvé ou inactif"));
    }

    res.status(200).json({
      success: true,
      message: "Token valide",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profilePicture: user.avatar,
      },
    });
  } catch (error) {
    next(createError(401, "Token invalide"));
  }
};

// Fonction pour maintenir la compatibilité
export const googleAuth = google;
