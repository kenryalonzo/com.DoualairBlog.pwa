import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Folder,
  Tag,
  Eye,
  TrendingUp,
  Calendar,
  Users,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Star,
} from 'lucide-react';
import { useToastContext } from '../../contexts/ToastContext';
import { articleService } from '../../services/articleService';
import { categoryService } from '../../services/categoryService';
import { tagService } from '../../services/tagService';

interface Stats {
  articles: {
    total: number;
    published: number;
    draft: number;
    archived: number;
    totalViews: number;
    featured: number;
  };
  categories: {
    total: number;
    active: number;
  };
  tags: {
    total: number;
    totalUsage: number;
  };
  recent: {
    articles: any[];
    categories: any[];
    tags: any[];
  };
}

const StatsOverview: React.FC = () => {
  const { toast } = useToastContext();
  const [stats, setStats] = useState<Stats>({
    articles: {
      total: 0,
      published: 0,
      draft: 0,
      archived: 0,
      totalViews: 0,
      featured: 0,
    },
    categories: {
      total: 0,
      active: 0,
    },
    tags: {
      total: 0,
      totalUsage: 0,
    },
    recent: {
      articles: [],
      categories: [],
      tags: [],
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques en parallèle
      const [articlesResponse, categoriesResponse, tagsResponse] = await Promise.all([
        articleService.getStats(),
        categoryService.getAll({ limit: 100 }),
        tagService.getAll({ limit: 100 }),
      ]);

      // Calculer les statistiques des articles
      const articleStats = articlesResponse || {
        totalArticles: 0,
        publishedArticles: 0,
        draftArticles: 0,
        archivedArticles: 0,
        totalViews: 0,
        featuredArticles: 0,
      };

      // Calculer les statistiques des catégories
      const categories = categoriesResponse.categories || [];
      const categoryStats = {
        total: categories.length,
        active: categories.filter(c => c.isActive).length,
      };

      // Calculer les statistiques des tags
      const tags = tagsResponse.tags || [];
      const tagStats = {
        total: tags.length,
        totalUsage: tags.reduce((sum, tag) => sum + (tag.usageCount || 0), 0),
      };

      setStats({
        articles: {
          total: articleStats.totalArticles,
          published: articleStats.publishedArticles,
          draft: articleStats.draftArticles,
          archived: articleStats.archivedArticles || 0,
          totalViews: articleStats.totalViews,
          featured: articleStats.featuredArticles || 0,
        },
        categories: categoryStats,
        tags: tagStats,
        recent: {
          articles: [], // À implémenter si nécessaire
          categories: categories.slice(0, 5),
          tags: tags.slice(0, 5),
        },
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Articles Totaux',
      value: stats.articles.total,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Articles Publiés',
      value: stats.articles.published,
      icon: Eye,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Brouillons',
      value: stats.articles.draft,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Vues Totales',
      value: stats.articles.totalViews.toLocaleString(),
      icon: TrendingUp,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      title: 'Catégories',
      value: stats.categories.total,
      icon: Folder,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Tags',
      value: stats.tags.total,
      icon: Tag,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tableau de Bord</h1>
          <p className="text-base-content/60">
            Vue d'ensemble de votre blog
          </p>
        </div>
        
        <button
          onClick={loadStats}
          className="btn btn-outline"
        >
          <Activity className="w-4 h-4 mr-2" />
          Actualiser
        </button>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-base-content/60">
                    {card.title}
                  </h3>
                  <p className="text-2xl font-bold mt-1">
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Graphiques et détails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des articles */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <PieChart className="w-5 h-5" />
              Répartition des Articles
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span className="text-sm">Publiés</span>
                </div>
                <span className="font-medium">{stats.articles.published}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <span className="text-sm">Brouillons</span>
                </div>
                <span className="font-medium">{stats.articles.draft}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-error rounded-full"></div>
                  <span className="text-sm">Archivés</span>
                </div>
                <span className="font-medium">{stats.articles.archived}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm">À la une</span>
                </div>
                <span className="font-medium">{stats.articles.featured}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activité récente */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <BarChart3 className="w-5 h-5" />
              Résumé du Contenu
            </h3>
            
            <div className="space-y-4">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <Folder className="w-8 h-8" />
                </div>
                <div className="stat-title">Catégories Actives</div>
                <div className="stat-value text-primary">{stats.categories.active}</div>
                <div className="stat-desc">sur {stats.categories.total} total</div>
              </div>
              
              <div className="stat">
                <div className="stat-figure text-secondary">
                  <Tag className="w-8 h-8" />
                </div>
                <div className="stat-title">Utilisation des Tags</div>
                <div className="stat-value text-secondary">{stats.tags.totalUsage}</div>
                <div className="stat-desc">{stats.tags.total} tags créés</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catégories et Tags récents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Catégories récentes */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <Folder className="w-5 h-5" />
              Catégories
            </h3>
            
            {stats.recent.categories.length > 0 ? (
              <div className="space-y-2">
                {stats.recent.categories.map((category) => (
                  <div key={category._id} className="flex items-center justify-between p-2 rounded hover:bg-base-200">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <span className={`badge badge-sm ${category.isActive ? 'badge-success' : 'badge-warning'}`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/60 text-sm">Aucune catégorie créée</p>
            )}
          </div>
        </div>

        {/* Tags récents */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <Tag className="w-5 h-5" />
              Tags Populaires
            </h3>
            
            {stats.recent.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {stats.recent.tags
                  .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
                  .slice(0, 10)
                  .map((tag) => (
                    <span
                      key={tag._id}
                      className="badge badge-outline"
                      style={{ borderColor: tag.color, color: tag.color }}
                    >
                      {tag.name} ({tag.usageCount || 0})
                    </span>
                  ))}
              </div>
            ) : (
              <p className="text-base-content/60 text-sm">Aucun tag créé</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
