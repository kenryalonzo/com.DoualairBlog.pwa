import { NextFunction, Request, Response } from "express";
import User from "../models/user.model.js";
import { AuthRequest, ControllerFunction } from "../types/index.js";
import { createError } from "../utils/error.js";

// Obtenir le profil utilisateur
export const getUserProfile: ControllerFunction = async (
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

    // Log pour debug
    console.log("[getUserProfile] User data:", {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
    });

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour le profil utilisateur
export const updateUserProfile: ControllerFunction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(createError(401, "Utilisateur non authentifié"));
    }

    const { firstName, lastName, avatar } = req.body;
    const updateData: any = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -refreshTokens");

    if (!user) {
      return next(createError(404, "Utilisateur non trouvé"));
    }

    res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// Supprimer le compte utilisateur
export const deleteUser: ControllerFunction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(createError(401, "Utilisateur non authentifié"));
    }

    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
      return next(createError(404, "Utilisateur non trouvé"));
    }

    res.status(200).json({
      success: true,
      message: "Compte supprimé avec succès",
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir tous les utilisateurs (admin seulement)
export const getAllUsers: ControllerFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("-password -refreshTokens")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir un utilisateur par ID (admin seulement)
export const getUserById: ControllerFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password -refreshTokens");
    if (!user) {
      return next(createError(404, "Utilisateur non trouvé"));
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour un utilisateur (admin seulement)
export const updateUserById: ControllerFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, isActive, isVerified } = req.body;

    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isVerified !== undefined) updateData.isVerified = isVerified;

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -refreshTokens");

    if (!user) {
      return next(createError(404, "Utilisateur non trouvé"));
    }

    res.status(200).json({
      success: true,
      message: "Utilisateur mis à jour avec succès",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// Supprimer un utilisateur (admin seulement)
export const deleteUserById: ControllerFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return next(createError(404, "Utilisateur non trouvé"));
    }

    res.status(200).json({
      success: true,
      message: "Utilisateur supprimé avec succès",
    });
  } catch (error) {
    next(error);
  }
};
