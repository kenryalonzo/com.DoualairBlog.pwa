import { apiCall } from './api';

// Types pour les tags
export interface Tag {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  articlesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagData {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateTagData extends Partial<CreateTagData> {}

export interface TagFilters {
  page?: number;
  limit?: number;
  search?: string;
  withArticles?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface TagsResponse {
  tags: Tag[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface TagStatsResponse {
  stats: {
    totalTags: number;
    usedTags: number;
    unusedTags: number;
    avgArticlesPerTag: number;
  };
  recentTags: Tag[];
  topTags: Tag[];
}

export interface TagCloudItem extends Tag {
  weight: number;
}

// Service pour les tags (Admin)
export const tagService = {
  // Créer un tag
  async create(data: CreateTagData): Promise<{ tag: Tag }> {
    return await apiCall('/admin/tags', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Créer plusieurs tags
  async createMultiple(names: string[]): Promise<{ tags: Tag[] }> {
    return await apiCall('/admin/tags/multiple', {
      method: 'POST',
      body: JSON.stringify({ names })
    });
  },

  // Obtenir tous les tags
  async getAll(filters: TagFilters = {}): Promise<TagsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/tags?${queryString}` : '/admin/tags';
    
    return await apiCall(endpoint);
  },

  // Obtenir un tag par ID
  async getById(id: string): Promise<{ tag: Tag }> {
    return await apiCall(`/admin/tags/${id}`);
  },

  // Mettre à jour un tag
  async update(id: string, data: UpdateTagData): Promise<{ tag: Tag }> {
    return await apiCall(`/admin/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Supprimer un tag
  async delete(id: string): Promise<{ message: string }> {
    return await apiCall(`/admin/tags/${id}`, {
      method: 'DELETE'
    });
  },

  // Fusionner deux tags
  async merge(sourceId: string, targetId: string): Promise<{ message: string }> {
    return await apiCall('/admin/tags/merge', {
      method: 'POST',
      body: JSON.stringify({ sourceId, targetId })
    });
  },

  // Nettoyer les tags inutilisés
  async cleanup(): Promise<{ message: string; deletedCount: number }> {
    return await apiCall('/admin/tags/cleanup', {
      method: 'POST'
    });
  },

  // Obtenir les tags populaires
  async getPopular(limit = 20): Promise<{ tags: Tag[] }> {
    return await apiCall(`/admin/tags/popular?limit=${limit}`);
  },

  // Obtenir le nuage de tags
  async getTagCloud(limit = 50): Promise<{ tagCloud: TagCloudItem[] }> {
    return await apiCall(`/admin/tags/cloud?limit=${limit}`);
  },

  // Obtenir les statistiques
  async getStats(): Promise<TagStatsResponse> {
    return await apiCall('/admin/tags/stats');
  }
};

// Service pour les tags publics
export const publicTagService = {
  // Obtenir les tags populaires
  async getPopular(limit = 20): Promise<{ tags: Tag[] }> {
    return await apiCall(`/tags/popular?limit=${limit}`);
  },

  // Obtenir le nuage de tags
  async getTagCloud(limit = 50): Promise<{ tagCloud: TagCloudItem[] }> {
    return await apiCall(`/tags/cloud?limit=${limit}`);
  }
};
