import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { signOutSuccess } from "../redux/user/userSlice";

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: "user" | "admin";
}

export const useAuth = () => {
  const dispatch = useDispatch();
  const { currentUser, token, loading, error } = useSelector(
    (state: RootState) => state.user
  );

  // Vérifier s'il y a un utilisateur JWT dans localStorage
  const getJWTUser = (): User | null => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("auth_token");

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        return {
          id: parsedUser.id,
          username: parsedUser.username,
          email: parsedUser.email,
          firstName: parsedUser.name?.split(" ")[0],
          lastName: parsedUser.name?.split(" ")[1],
          avatar: parsedUser.photo || parsedUser.avatar,
          role: parsedUser.role as "user" | "admin",
        };
      }
    } catch (error) {
      console.error("Erreur lors du parsing de l'utilisateur JWT:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("auth_token");
    }
    return null;
  };

  const jwtUser = getJWTUser();
  const effectiveUser = jwtUser || currentUser;
  const effectiveToken = jwtUser ? localStorage.getItem("auth_token") : token;

  return {
    // Données utilisateur
    user: effectiveUser as User | null,
    token: effectiveToken,
    loading,
    error,

    // États d'authentification
    isAuthenticated: !!effectiveUser && (!!effectiveToken || !!currentUser),
    isAdmin: effectiveUser?.role === "admin",
    isUser: effectiveUser?.role === "user",

    // Méthodes utilitaires
    hasRole: (role: "user" | "admin") => effectiveUser?.role === role,
    canAccess: (requiredRole?: "admin") => {
      if (!effectiveUser) return false;
      if (!requiredRole) return true;
      return effectiveUser.role === requiredRole;
    },

    // Informations utilisateur
    getDisplayName: () => {
      if (!effectiveUser) return "";
      if (effectiveUser.firstName && effectiveUser.lastName) {
        return `${effectiveUser.firstName} ${effectiveUser.lastName}`;
      }
      return effectiveUser.username;
    },

    getInitials: () => {
      if (!effectiveUser) return "";
      if (effectiveUser.firstName && effectiveUser.lastName) {
        return `${effectiveUser.firstName[0]}${effectiveUser.lastName[0]}`.toUpperCase();
      }
      return effectiveUser.username.substring(0, 2).toUpperCase();
    },

    // Méthode de déconnexion unifiée
    logout: () => {
      // Nettoyer localStorage (JWT)
      localStorage.removeItem("user");
      localStorage.removeItem("auth_token");

      // Nettoyer Redux (Firebase)
      dispatch(signOutSuccess());

      console.log("Déconnexion complète effectuée (JWT + Redux)");
    },

    // Méthode JWT legacy (pour compatibilité)
    logoutJWT: () => {
      localStorage.removeItem("user");
      localStorage.removeItem("auth_token");
    },

    authType: jwtUser ? "jwt" : currentUser ? "firebase" : null,
  };
};

export default useAuth;
