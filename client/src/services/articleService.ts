import { apiCall } from './api';

// Types pour les articles
export interface Article {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  featuredVideo?: string;
  videoType?: 'upload' | 'youtube' | 'vimeo' | 'url';
  videoThumbnail?: string;
  videoDuration?: number;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
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
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    username: string;
    avatar?: string;
  };
  category?: {
    _id: string;
    name: string;
    slug: string;
    color?: string;
  };
  tagDetails?: Array<{
    _id: string;
    name: string;
    slug: string;
    color?: string;
  }>;
}

export interface CreateArticleData {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  featuredVideo?: string;
  videoType?: 'upload' | 'youtube' | 'vimeo' | 'url';
  categoryId?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  isFeatured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface UpdateArticleData extends Partial<CreateArticleData> {}

export interface ArticleFilters {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published' | 'archived';
  categoryId?: string;
  tags?: string[];
  authorId?: string;
  isFeatured?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ArticlesResponse {
  articles: Article[];
  pagination: PaginationInfo;
}

export interface HomeArticlesResponse {
  featured: Article | null;
  recent: Article[];
  popular: Article[];
  categories: Array<{
    _id: string;
    name: string;
    slug: string;
    color?: string;
    articlesCount: number;
  }>;
}

export interface ArticleStatsResponse {
  stats: {
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    archivedArticles: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
  };
  recentArticles: Article[];
}

// Service pour les articles (Admin)
export const articleService = {
  // Créer un article
  async create(data: CreateArticleData): Promise<{ article: Article }> {
    return await apiCall('/admin/articles', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Obtenir tous les articles (admin)
  async getAll(filters: ArticleFilters = {}): Promise<ArticlesResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/articles?${queryString}` : '/admin/articles';
    
    return await apiCall(endpoint);
  },

  // Obtenir un article par ID
  async getById(id: string): Promise<{ article: Article }> {
    return await apiCall(`/admin/articles/${id}`);
  },

  // Mettre à jour un article
  async update(id: string, data: UpdateArticleData): Promise<{ article: Article }> {
    return await apiCall(`/admin/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Supprimer un article
  async delete(id: string): Promise<{ message: string }> {
    return await apiCall(`/admin/articles/${id}`, {
      method: 'DELETE'
    });
  },

  // Changer le statut d'un article
  async updateStatus(id: string, status: 'draft' | 'published' | 'archived'): Promise<{ article: Article }> {
    return await apiCall(`/admin/articles/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // Obtenir les statistiques
  async getStats(): Promise<ArticleStatsResponse> {
    return await apiCall('/admin/articles/stats');
  }
};

// Service pour les articles publics
export const publicArticleService = {
  // Obtenir les articles pour la page d'accueil
  async getHomeArticles(): Promise<HomeArticlesResponse> {
    return await apiCall('/articles/home');
  },

  // Obtenir les articles publiés
  async getPublished(filters: Omit<ArticleFilters, 'status'> = {}): Promise<ArticlesResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/articles?${queryString}` : '/articles';
    
    return await apiCall(endpoint);
  },

  // Obtenir un article par slug
  async getBySlug(slug: string): Promise<{ 
    article: Article; 
    similarArticles: Article[];
    userInteractions?: {
      isLiked: boolean;
      isFavorited: boolean;
    };
  }> {
    return await apiCall(`/articles/${slug}`);
  },

  // Rechercher des articles
  async search(query: string, filters: Partial<ArticleFilters> = {}): Promise<ArticlesResponse & { query: string }> {
    const params = new URLSearchParams({ q: query });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return await apiCall(`/articles/search?${params.toString()}`);
  },

  // Obtenir les articles par catégorie
  async getByCategory(categorySlug: string, filters: Partial<ArticleFilters> = {}): Promise<ArticlesResponse & { 
    category: {
      _id: string;
      name: string;
      slug: string;
      description?: string;
      color?: string;
    };
  }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = queryString 
      ? `/articles/category/${categorySlug}?${queryString}` 
      : `/articles/category/${categorySlug}`;
    
    return await apiCall(endpoint);
  },

  // Obtenir les articles par tag
  async getByTag(tagSlug: string, filters: Partial<ArticleFilters> = {}): Promise<ArticlesResponse & { 
    tag: {
      _id: string;
      name: string;
      slug: string;
      color?: string;
    };
  }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = queryString 
      ? `/articles/tag/${tagSlug}?${queryString}` 
      : `/articles/tag/${tagSlug}`;
    
    return await apiCall(endpoint);
  }
};
