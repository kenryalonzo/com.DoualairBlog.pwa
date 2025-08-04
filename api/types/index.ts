import { NextFunction, Request, Response } from "express";
import { Document } from "mongoose";

// Types pour l'utilisateur
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: "user" | "admin" | "moderator";
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Types pour les requêtes authentifiées
export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

// Types pour les tokens
export interface TokenPayload {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode?: number;
}

// Types pour les erreurs
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// Types pour la validation
export interface ValidationError {
  field: string;
  message: string;
}

// Types pour les requêtes de pagination
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: "asc" | "desc";
}

// Types pour les filtres utilisateur
export interface UserFilters {
  role?: string;
  isVerified?: boolean;
  isActive?: boolean;
  search?: string;
}

// Types pour les middlewares
export type MiddlewareFunction = (
  req: Request | AuthRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

// Types pour les contrôleurs
export type ControllerFunction = (
  req: Request | AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

// Types pour les routes
export interface RouteConfig {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  handler: ControllerFunction;
  middleware?: MiddlewareFunction[];
  auth?: boolean;
}

// Types pour la configuration
export interface DatabaseConfig {
  uri: string;
  options: {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
  };
}

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string | string[];
}

export interface JwtConfig {
  secret: string;
  refreshSecret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

// Types pour les utilitaires
export interface CleanupConfig {
  interval: number;
  maxAge: number;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}
