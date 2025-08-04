import type { User } from "./types";

/**
 * Récupère la photo de profil de l'utilisateur en priorité
 * @param user - L'objet utilisateur
 * @returns L'URL de la photo de profil ou undefined
 */
export const getUserProfilePicture = (
  user: User | null | undefined
): string | undefined => {
  if (!user) return undefined;

  // Priorité : profilePicture > photo > undefined
  return user.profilePicture || user.photo || undefined;
};

/**
 * Génère une URL d'avatar par défaut basée sur le nom d'utilisateur
 * @param username - Le nom d'utilisateur
 * @returns L'URL de l'avatar par défaut
 */
export const getDefaultAvatar = (username?: string): string => {
  const initial = username?.charAt(0)?.toUpperCase() || "U";
  return `https://placehold.co/80x80/E2E8F0/475569?text=${initial}`;
};

/**
 * Vérifie si l'utilisateur a une photo de profil
 * @param user - L'objet utilisateur
 * @returns true si l'utilisateur a une photo de profil
 */
export const hasProfilePicture = (user: User | null | undefined): boolean => {
  return !!(user?.profilePicture || user?.photo);
};
