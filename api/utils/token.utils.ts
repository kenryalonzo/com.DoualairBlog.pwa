import { Response } from "express";
import jwt from "jsonwebtoken";
import { TokenPayload, TokenResponse } from "../types/index.js";

// Générer un token d'accès
export const generateAccessToken = (payload: TokenPayload): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET non défini");
  }

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // Token court pour la sécurité
  );
};

// Générer un token de rafraîchissement
export const generateRefreshToken = (payload: TokenPayload): string => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET non défini");
  }

  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" } // Token long pour le rafraîchissement
  );
};

// Vérifier un token d'accès
export const verifyAccessToken = (token: string): TokenPayload => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET non défini");
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error("Token d'accès invalide");
  }
};

// Vérifier un token de rafraîchissement
export const verifyRefreshToken = (token: string): TokenPayload => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET non défini");
  }

  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error("Token de rafraîchissement invalide");
  }
};

// Interface pour les options de cookies
interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  maxAge: number;
  domain?: string;
}

// Configurer les options des cookies
export const getCookieOptions = (isRefreshToken = false): CookieOptions => {
  const options: CookieOptions = {
    httpOnly: true, // Empêche l'accès via JavaScript
    secure: process.env.NODE_ENV === "production", // HTTPS en production
    sameSite: "strict", // Protection CSRF
    maxAge: isRefreshToken
      ? 7 * 24 * 60 * 60 * 1000 // 7 jours pour le refresh token
      : 15 * 60 * 1000, // 15 minutes pour l'access token
  };

  // Ajouter le domaine en production
  if (process.env.NODE_ENV === "production" && process.env.COOKIE_DOMAIN) {
    options.domain = process.env.COOKIE_DOMAIN;
  }

  return options;
};

// Nettoyer les cookies
export const clearAuthCookies = (res: Response): void => {
  res.clearCookie("access_token", getCookieOptions());
  res.clearCookie("refresh_token", getCookieOptions(true));
};

// Définir les cookies d'authentification
export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  res.cookie("access_token", accessToken, getCookieOptions());
  res.cookie("refresh_token", refreshToken, getCookieOptions(true));
};

// Générer les tokens d'authentification
export const generateAuthTokens = (payload: TokenPayload): TokenResponse => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60 * 1000, // 15 minutes en millisecondes
  };
};

// Extraire le token du header Authorization
export const extractTokenFromHeader = (
  authHeader: string | undefined
): string | null => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.substring(7); // Enlever "Bearer "
};
