const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Types pour l'authentification
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role: 'user' | 'admin';
    profilePicture?: string;
  };
  error?: string;
}

export interface GoogleAuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role: 'user' | 'admin';
    profilePicture?: string;
  };
  error?: string;
}

// Configuration par défaut pour fetch
const defaultOptions: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Pour inclure les cookies
};

// Service d'authentification centralisé
export const authService = {
  // Connexion classique (email/password)
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  },

  // Authentification Google
  async googleAuth(idToken: string): Promise<GoogleAuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur d\'authentification Google');
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de l\'authentification Google:', error);
      throw error;
    }
  },

  // Déconnexion
  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        ...defaultOptions,
        method: 'POST',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de déconnexion');
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  },

  // Vérification du token
  async verifyToken(): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        ...defaultOptions,
        method: 'GET',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Token invalide');
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      throw error;
    }
  }
};

// Service général pour les autres appels API
export const apiService = {
  async get(endpoint: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        method: 'GET',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de requête');
      }

      return data;
    } catch (error) {
      console.error(`Erreur lors de la requête GET ${endpoint}:`, error);
      throw error;
    }
  },

  async post(endpoint: string, body: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de requête');
      }

      return data;
    } catch (error) {
      console.error(`Erreur lors de la requête POST ${endpoint}:`, error);
      throw error;
    }
  }
};

// Service utilisateur pour la gestion du profil
export const userService = {
  // Obtenir le profil utilisateur
  async getProfile(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        ...defaultOptions,
        method: 'GET',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération du profil');
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      throw error;
    }
  },

  // Mettre à jour le profil utilisateur
  async updateProfile(profileData: {
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  }): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        ...defaultOptions,
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour du profil');
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  },

  // Changer le mot de passe
  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        ...defaultOptions,
        method: 'PUT',
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du changement de mot de passe');
      }

      return data;
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      throw error;
    }
  },

  // Supprimer le compte
  async deleteAccount(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        ...defaultOptions,
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la suppression du compte');
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      throw error;
    }
  }
};

export default { authService, apiService, userService };
