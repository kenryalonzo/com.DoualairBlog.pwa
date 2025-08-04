import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";
import { IUser } from "../types/index.js";

// Interface pour les tokens de rafraîchissement
interface IRefreshToken {
  token: string;
  expiresAt: Date;
  deviceInfo: string;
}

// Interface pour le schéma utilisateur
interface IUserDocument extends IUser {
  refreshTokens: IRefreshToken[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  deviceInfo: {
    type: String,
    default: "Unknown device",
  },
});

const userSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false, // Optionnel pour OAuth
      minlength: 6,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    refreshTokens: [refreshTokenSchema],
  },
  {
    timestamps: true,
  }
);

// Middleware de pré-sauvegarde pour hasher le mot de passe
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Erreur lors de la comparaison des mots de passe");
  }
};

// Méthode pour nettoyer les tokens expirés
userSchema.methods.cleanExpiredTokens = function (): void {
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter(
    (token) => token.expiresAt > now
  );
};

// Méthode pour ajouter un token de rafraîchissement
userSchema.methods.addRefreshToken = function (
  token: string,
  expiresAt: Date,
  deviceInfo: string
): void {
  this.refreshTokens.push({ token, expiresAt, deviceInfo });
};

// Méthode pour supprimer un token de rafraîchissement
userSchema.methods.removeRefreshToken = function (token: string): void {
  this.refreshTokens = this.refreshTokens.filter((t) => t.token !== token);
};

// Méthode pour vérifier si un token existe
userSchema.methods.hasRefreshToken = function (token: string): boolean {
  return this.refreshTokens.some((t) => t.token === token);
};

const User = mongoose.model<IUserDocument>("User", userSchema);

export default User;
export type { IRefreshToken, IUserDocument };
