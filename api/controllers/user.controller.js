import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const test = (req, res) => {
  res.json({
    success: true,
    message: "API Doualair Blog fonctionnelle",
  });
};

// Obtenir tous les utilisateurs (admin seulement)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password -refreshTokens");
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour le profil utilisateur
export const updateProfile = async (req, res, next) => {
  try {
    const { username, email, name, photo } = req.body;
    const userId = req.user._id;

    // Vérifier si l'email ou username existe déjà
    if (email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: userId },
      });
      if (existingUser) {
        return next(errorHandler(400, "Cet email est déjà utilisé"));
      }
    }

    if (username) {
      const existingUser = await User.findOne({
        username: username.trim(),
        _id: { $ne: userId },
      });
      if (existingUser) {
        return next(errorHandler(400, "Ce nom d'utilisateur est déjà utilisé"));
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(username && { username: username.trim() }),
        ...(email && { email: email.toLowerCase().trim() }),
        ...(name && { name: name.trim() }),
        ...(photo && { photo }),
      },
      { new: true, runValidators: true }
    ).select("-password -refreshTokens");

    res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour le mot de passe
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return next(errorHandler(400, "Mot de passe actuel et nouveau mot de passe requis"));
    }

    if (newPassword.length < 6) {
      return next(errorHandler(400, "Le nouveau mot de passe doit contenir au moins 6 caractères"));
    }

    // Trouver l'utilisateur avec le mot de passe
    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler(404, "Utilisateur non trouvé"));
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = bcrypt.compareSync(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return next(errorHandler(400, "Mot de passe actuel incorrect"));
    }

    // Hasher le nouveau mot de passe
    const hashedNewPassword = bcrypt.hashSync(newPassword, 12);

    // Mettre à jour le mot de passe
    await User.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
    });

    res.status(200).json({
      success: true,
      message: "Mot de passe mis à jour avec succès",
    });
  } catch (error) {
    next(error);
  }
};

// Supprimer le compte utilisateur
export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const userId = req.user._id;

    if (!password) {
      return next(errorHandler(400, "Mot de passe requis pour supprimer le compte"));
    }

    // Trouver l'utilisateur avec le mot de passe
    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler(404, "Utilisateur non trouvé"));
    }

    // Vérifier le mot de passe
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return next(errorHandler(400, "Mot de passe incorrect"));
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(userId);

    // Nettoyer les cookies
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    res.status(200).json({
      success: true,
      message: "Compte supprimé avec succès",
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir les statistiques utilisateur
export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password -refreshTokens");

    if (!user) {
      return next(errorHandler(404, "Utilisateur non trouvé"));
    }

    // Statistiques factices pour l'instant
    const stats = {
      articlesRead: Math.floor(Math.random() * 50) + 10,
      favoriteArticles: Math.floor(Math.random() * 20) + 5,
      comments: Math.floor(Math.random() * 30) + 8,
      readingTime: `${Math.floor(Math.random() * 10) + 1}h ${Math.floor(Math.random() * 60)}m`,
      joinDate: user.createdAt,
      lastActivity: user.lastLogin || user.createdAt,
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};
