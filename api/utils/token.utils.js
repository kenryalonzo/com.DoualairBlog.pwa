import jwt from "jsonwebtoken";

// Générer un token d'accès
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // Token court pour la sécurité
  );
};

// Générer un token de rafraîchissement
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" } // Token long pour le rafraîchissement
  );
};

// Vérifier un token de rafraîchissement
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error("Token de rafraîchissement invalide");
  }
};

// Configurer les options des cookies
export const getCookieOptions = (isRefreshToken = false) => {
  const options = {
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
export const clearAuthCookies = (res) => {
  res.clearCookie("access_token", getCookieOptions());
  res.clearCookie("refresh_token", getCookieOptions(true));
};

// Définir les cookies d'authentification
export const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("access_token", accessToken, getCookieOptions());
  res.cookie("refresh_token", refreshToken, getCookieOptions(true));
};
