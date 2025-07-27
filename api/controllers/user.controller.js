import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";

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
    const { username, email } = req.body;
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
