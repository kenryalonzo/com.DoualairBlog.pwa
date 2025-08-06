const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Fonction pour récupérer le token depuis le localStorage ou Redux
const getAuthToken = () => {
  // D'abord essayer le localStorage pour la persistance
  const persistedState = localStorage.getItem("persist:root");
  if (persistedState) {
    try {
      const parsed = JSON.parse(persistedState);
      const userState = JSON.parse(parsed.user);
      return userState.token;
    } catch (error) {
      console.warn("[API] Erreur lors de la récupération du token:", error);
    }
  }
  return null;
};

// Configuration par défaut pour les requêtes
const defaultOptions: RequestInit = {
  credentials: "include", // Important pour les cookies
  headers: {
    "Content-Type": "application/json",
  },
};

// Fonction pour créer un timeout
const createTimeoutPromise = (timeoutMs: number) => {
  return new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error("Timeout: La requête a pris trop de temps")),
      timeoutMs
    );
  });
};

// Fonction utilitaire pour les appels API
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = { ...defaultOptions, ...options };

  // Ajouter le token d'authentification si disponible
  let token = getAuthToken();

  // Si pas de token Firebase, vérifier localStorage
  if (!token) {
    token = localStorage.getItem("auth_token");
  }

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
    console.log("[API] Token ajouté aux headers");
  } else {
    console.log("[API] Aucun token trouvé");
  }

  console.log(`[API] ${config.method || "GET"} ${url}`);

  try {
    // Utiliser Promise.race pour implémenter un timeout
    const response = (await Promise.race([
      fetch(url, config),
      createTimeoutPromise(timeoutMs),
    ])) as Response;

    console.log(`[API] Response status:`, response.status);

    // Vérifier si la réponse est du JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error(`[API] Non-JSON response:`, text);
      throw new Error(`Réponse non-JSON reçue: ${text}`);
    }

    const data = await response.json();

    if (!response.ok) {
      console.error(`[API] Error response:`, data);
    }

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
  checkAuth: () => apiCall("/auth/check"),

  // Obtenir le profil
  getProfile: () => apiCall("/auth/profile"),

  // Test simple
  testConnection: () => apiCall("/auth/check"),
};

// Services utilisateur
export const userService = {
  // Obtenir le profil utilisateur
  getProfile: () => apiCall("/user/profile"),

  // Mettre à jour le profil
  updateProfile: (profileData: {
    username?: string;
    email?: string;
    profilePicture?: string;
    firstName?: string;
    lastName?: string;
  }) =>
    apiCall("/user/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),

  // Mettre à jour le mot de passe
  updatePassword: (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) =>
    apiCall("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    }),

  // Supprimer le compte
  deleteAccount: () =>
    apiCall("/user/profile", {
      method: "DELETE",
    }),

  // Obtenir les statistiques utilisateur
  getUserStats: () => apiCall("/user/stats"),
};

export default authService;
