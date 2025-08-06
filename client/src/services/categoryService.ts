import { apiCall } from './api';

// Types pour les catégories
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  isActive: boolean;
  articlesCount: number;
  createdAt: string;
  updatedAt: string;
  parent?: {
    _id: string;
    name: string;
    slug: string;
    color?: string;
  };
  children?: Category[];
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  isActive?: boolean;
}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  parentId?: string | null;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CategoriesResponse {
  categories: Category[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CategoryStatsResponse {
  stats: {
    totalCategories: number;
    activeCategories: number;
    inactiveCategories: number;
    rootCategories: number;
    categoriesWithArticles: number;
    emptyCategoriesCount: number;
  };
  topCategories: Array<{
    _id: string;
    name: string;
    slug: string;
    articlesCount: number;
    color?: string;
  }>;
}

// Service pour les catégories (Admin)
export const categoryService = {
  // Créer une catégorie
  async create(data: CreateCategoryData): Promise<{ category: Category }> {
    return await apiCall('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Obtenir toutes les catégories
  async getAll(filters: CategoryFilters = {}): Promise<CategoriesResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'parentId' && value === null) {
          params.append(key, 'null');
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/categories?${queryString}` : '/admin/categories';
    
    return await apiCall(endpoint);
  },

  // Obtenir la hiérarchie des catégories
  async getHierarchy(): Promise<{ hierarchy: Category[] }> {
    return await apiCall('/admin/categories/hierarchy');
  },

  // Obtenir une catégorie par ID
  async getById(id: string): Promise<{ category: Category }> {
    return await apiCall(`/admin/categories/${id}`);
  },

  // Mettre à jour une catégorie
  async update(id: string, data: UpdateCategoryData): Promise<{ category: Category }> {
    return await apiCall(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Supprimer une catégorie
  async delete(id: string): Promise<{ message: string }> {
    return await apiCall(`/admin/categories/${id}`, {
      method: 'DELETE'
    });
  },

  // Changer le statut d'une catégorie
  async updateStatus(id: string, isActive: boolean): Promise<{ category: Category }> {
    return await apiCall(`/admin/categories/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive })
    });
  },

  // Obtenir les statistiques
  async getStats(): Promise<CategoryStatsResponse> {
    return await apiCall('/admin/categories/stats');
  }
};

// Service pour les catégories publiques
export const publicCategoryService = {
  // Obtenir les catégories actives
  async getActive(): Promise<{ categories: Category[] }> {
    return await apiCall('/categories/active');
  },

  // Obtenir les catégories populaires
  async getPopular(limit = 10): Promise<{ categories: Category[] }> {
    return await apiCall(`/categories/popular?limit=${limit}`);
  }
};
