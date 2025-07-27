import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  verifyRefreshToken,
} from "../utils/token.utils.js";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    return next(errorHandler(400, "Tous les champs sont obligatoires"));
  }

  // Validation supplémentaire
  if (password.length < 6) {
    return next(
      errorHandler(400, "Le mot de passe doit contenir au moins 6 caractères")
    );
  }

  if (username.length < 3) {
    return next(
      errorHandler(
        400,
        "Le nom d'utilisateur doit contenir au moins 3 caractères"
      )
    );
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return next(
        errorHandler(
          400,
          "Un utilisateur avec cet email ou nom d'utilisateur existe déjà"
        )
      );
    }

    const hashedPassword = bcrypt.hashSync(password, 12);

    const newUser = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    next(errorHandler(500, "Erreur lors de la création de l'utilisateur"));
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === "" || password === "") {
    return next(errorHandler(400, "Tous les champs sont obligatoires"));
  }

  try {
    const validUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (!validUser) {
      return next(errorHandler(404, "Email ou mot de passe incorrect"));
    }

    if (!validUser.isActive) {
      return next(
        errorHandler(403, "Compte désactivé. Contactez l'administrateur")
      );
    }

    const validPassword = bcrypt.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(400, "Email ou mot de passe incorrect"));
    }

    // Générer les tokens
    const accessToken = generateAccessToken(validUser._id);
    const refreshToken = generateRefreshToken(validUser._id);

    // Sauvegarder le token de rafraîchissement
    const deviceInfo = req.headers["user-agent"] || "Unknown device";
    validUser.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      deviceInfo,
    });

    // Mettre à jour la dernière connexion
    validUser.lastLogin = new Date();
    await validUser.save();

    // Définir les cookies
    setAuthCookies(res, accessToken, refreshToken);

    // Retourner les données utilisateur (sans mot de passe)
    const { password: pass, refreshTokens, ...userData } = validUser._doc;

    res.status(200).json({
      success: true,
      message: "Connexion réussie",
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

// Rafraîchir le token d'accès
export const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return next(errorHandler(401, "Token de rafraîchissement manquant"));
    }

    // Vérifier le token de rafraîchissement
    const decoded = verifyRefreshToken(refreshToken);

    // Trouver l'utilisateur et vérifier que le token existe dans sa liste
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(errorHandler(404, "Utilisateur non trouvé"));
    }

    const tokenExists = user.refreshTokens.find(
      (t) => t.token === refreshToken
    );
    if (!tokenExists) {
      return next(errorHandler(401, "Token de rafraîchissement invalide"));
    }

    // Vérifier l'expiration
    if (tokenExists.expiresAt < new Date()) {
      // Supprimer le token expiré
      user.refreshTokens = user.refreshTokens.filter(
        (t) => t.token !== refreshToken
      );
      await user.save();
      return next(errorHandler(401, "Token de rafraîchissement expiré"));
    }

    // Générer un nouveau token d'accès
    const newAccessToken = generateAccessToken(user._id);

    // Définir le nouveau cookie
    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.status(200).json({
      success: true,
      message: "Token rafraîchi avec succès",
    });
  } catch (error) {
    next(error);
  }
};

// Déconnexion
export const signout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (refreshToken) {
      // Supprimer le token de rafraîchissement de la base de données
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);

      if (user) {
        user.refreshTokens = user.refreshTokens.filter(
          (t) => t.token !== refreshToken
        );
        await user.save();
      }
    }

    // Nettoyer les cookies
    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: "Déconnexion réussie",
    });
  } catch (error) {
    // Même en cas d'erreur, on nettoie les cookies
    clearAuthCookies(res);
    next(error);
  }
};

// Obtenir le profil utilisateur
export const getProfile = async (req, res, next) => {
  try {
    const { password, refreshTokens, ...userData } = req.user._doc;

    res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

// Vérifier l'authentification
export const checkAuth = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: "Authentifié",
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
