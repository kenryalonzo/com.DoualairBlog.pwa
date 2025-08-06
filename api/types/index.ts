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

// ===== BLOG SYSTEM TYPES =====

// Types pour les articles
export interface IArticle extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  featuredVideo?: string;
  videoType?: "upload" | "youtube" | "vimeo" | "url";
  videoThumbnail?: string;
  videoDuration?: number;
  status: "draft" | "published" | "archived";
  publishedAt?: Date;
  authorId: string;
  categoryId?: string;
  tags: string[];
  viewCount: number;
  likesCount: number;
  commentsCount: number;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les catégories
export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  isActive: boolean;
  articlesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les tags
export interface ITag extends Document {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  articlesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les médias
export interface IMedia extends Document {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  type: "image" | "video" | "document";
  alt?: string;
  caption?: string;
  userId: string;
  articleId?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les commentaires
export interface IComment extends Document {
  content: string;
  articleId: string;
  userId: string;
  parentId?: string;
  isApproved: boolean;
  isEdited: boolean;
  editedAt?: Date;
  likesCount: number;
  repliesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les interactions utilisateur
export interface IUserInteraction extends Document {
  userId: string;
  articleId: string;
  type: "like" | "favorite" | "share" | "view";
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Types pour les requêtes d'articles
export interface ArticleFilters {
  status?: "draft" | "published" | "archived";
  categoryId?: string;
  tags?: string[];
  authorId?: string;
  isFeatured?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Types pour les requêtes publiques
export interface PublicArticleQuery extends PaginationQuery {
  category?: string;
  tag?: string;
  search?: string;
  featured?: boolean;
}

// Types pour les réponses d'articles
export interface ArticleResponse {
  article: IArticle;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  category?: ICategory;
  tags: ITag[];
  isLiked?: boolean;
  isFavorited?: boolean;
}

// Types pour les statistiques
export interface BlogStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  categoriesCount: number;
  tagsCount: number;
}
