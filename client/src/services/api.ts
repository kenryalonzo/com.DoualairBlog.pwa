const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Configuration par défaut pour les requêtes
const defaultOptions: RequestInit = {
  credentials: "include", // Important pour les cookies
  headers: {
    "Content-Type": "application/json",
  },
};

// Fonction utilitaire pour les appels API
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = { ...defaultOptions, ...options };
  
  console.log(`[API] ${config.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    console.log(`[API] Response:`, { status: response.status, success: response.ok });
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`[API] Error:`, error);
    throw error;
  }
};

// Services d'authentification
export const authService = {
  // Connexion classique
  signIn: (credentials: { email: string; password: string }) =>
    apiCall("/auth/signin", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  // Inscription
  signUp: (userData: { username: string; email: string; password: string }) =>
    apiCall("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  // Authentification Google
  googleAuth: (googleData: { name: string; email: string; photo?: string }) =>
    apiCall("/auth/google", {
      method: "POST",
      body: JSON.stringify(googleData),
    }),

  // Déconnexion
  signOut: () =>
    apiCall("/auth/signout", {
      method: "POST",
    }),

  // Rafraîchir le token
  refreshToken: () =>
    apiCall("/auth/refresh", {
      method: "POST",
    }),

  // Vérifier l'authentification
  checkAuth: () =>
    apiCall("/auth/check"),

  // Obtenir le profil
  getProfile: () =>
    apiCall("/auth/profile"),
};

// Services utilisateur
export const userService = {
  // Mettre à jour le profil
  updateProfile: (profileData: { username?: string; email?: string; name?: string; photo?: string }) =>
    apiCall("/user/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),

  // Mettre à jour le mot de passe
  updatePassword: (passwordData: { currentPassword: string; newPassword: string }) =>
    apiCall("/user/password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    }),

  // Supprimer le compte
  deleteAccount: (password: string) =>
    apiCall("/user/account", {
      method: "DELETE",
      body: JSON.stringify({ password }),
    }),

  // Obtenir les statistiques utilisateur
  getUserStats: () =>
    apiCall("/user/stats"),
};

export default authService;