import { motion } from "framer-motion";
import {
  Archive,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  FileText,
  Filter,
  Globe,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useToastContext } from "../../contexts/ToastContext";
import type { Article, ArticleFilters } from "../../services/articleService";
import { articleService } from "../../services/articleService";
import type { Category } from "../../services/categoryService";
import { categoryService } from "../../services/categoryService";

const ArticleManagement: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<ArticleFilters>({
    page: 1,
    limit: 12,
    sort: "createdAt",
    order: "desc",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    archivedArticles: 0,
    totalViews: 0,
    totalLikes: 0,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const { toast } = useToastContext();

  // Charger les articles
  const loadArticles = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const [articlesResponse, statsResponse] = await Promise.all([
        articleService.getAll(filters),
        articleService.getStats(),
      ]);

      setArticles(articlesResponse.articles);
      setPagination(articlesResponse.pagination);
      setStats(statsResponse.stats);
    } catch (error) {
      console.error("Erreur lors du chargement des articles:", error);
      toast.error("Erreur lors du chargement des articles");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger les catégories
  const loadCategories = async () => {
    try {
      const response = await categoryService.getAll({
        limit: 100,
        isActive: true,
      });
      setCategories(response.categories);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [filters]);

  useEffect(() => {
    loadCategories();
  }, []);

  // Gestionnaires d'événements
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleRefresh = () => {
    loadArticles(true);
  };

  const handleCreateArticle = () => {
    setEditingArticle(null);
    setShowEditor(true);
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingArticle(null);
  };

  const handleArticleSaved = () => {
    setShowEditor(false);
    setEditingArticle(null);
    loadArticles(true);
    toast.success("Article sauvegardé avec succès");
  };

  const handleStatusChange = async (
    articleId: string,
    newStatus: "draft" | "published" | "archived"
  ) => {
    try {
      await articleService.updateStatus(articleId, newStatus);
      toast.success(
        `Article ${
          newStatus === "published"
            ? "publié"
            : newStatus === "archived"
            ? "archivé"
            : "mis en brouillon"
        } avec succès`
      );
      loadArticles();
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      toast.error("Erreur lors du changement de statut");
    }
  };

  const handleDelete = async (articleId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;

    try {
      await articleService.delete(articleId);
      toast.success("Article supprimé avec succès");
      loadArticles(true);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  // Gestion de la sélection multiple
  const handleSelectArticle = (articleId: string) => {
    setSelectedArticles((prev) =>
      prev.includes(articleId)
        ? prev.filter((id) => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedArticles.length === articles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(articles.map((article) => article._id));
    }
  };

  const handleBulkAction = async (
    action: "publish" | "draft" | "archive" | "delete"
  ) => {
    if (selectedArticles.length === 0) return;

    const confirmMessage =
      action === "delete"
        ? `Êtes-vous sûr de vouloir supprimer ${selectedArticles.length} article(s) ?`
        : `Êtes-vous sûr de vouloir ${
            action === "publish"
              ? "publier"
              : action === "archive"
              ? "archiver"
              : "mettre en brouillon"
          } ${selectedArticles.length} article(s) ?`;

    if (!confirm(confirmMessage)) return;

    try {
      if (action === "delete") {
        await Promise.all(
          selectedArticles.map((id) => articleService.delete(id))
        );
        toast.success(
          `${selectedArticles.length} article(s) supprimé(s) avec succès`
        );
      } else {
        await Promise.all(
          selectedArticles.map((id) =>
            articleService.updateStatus(id, action as any)
          )
        );
        const actionText =
          action === "publish"
            ? "publié(s)"
            : action === "archive"
            ? "archivé(s)"
            : "mis en brouillon";
        toast.success(
          `${selectedArticles.length} article(s) ${actionText} avec succès`
        );
      }
      setSelectedArticles([]);
      loadArticles(true);
    } catch (error) {
      console.error("Erreur lors de l'action groupée:", error);
      toast.error("Erreur lors de l'action groupée");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { class: "badge-warning", text: "Brouillon" },
      published: { class: "badge-success", text: "Publié" },
      archived: { class: "badge-error", text: "Archivé" },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Si l'éditeur est ouvert, afficher seulement l'éditeur
  if (showEditor) {
    const EnhancedArticleEditor = React.lazy(
      () => import("./EnhancedArticleEditor")
    );

    return (
      <div className="h-full">
        <React.Suspense
          fallback={
            <div className="flex justify-center items-center h-full">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          }
        >
          <EnhancedArticleEditor
            article={editingArticle}
            onSave={handleArticleSaved}
            onCancel={handleCloseEditor}
          />
        </React.Suspense>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Articles</h1>
          <p className="text-base-content/70 mt-1">
            Créez et gérez vos articles de blog
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRefresh}
            className={`btn btn-ghost ${refreshing ? "loading" : ""}`}
            disabled={refreshing}
          >
            {!refreshing && <RefreshCw className="w-4 h-4 mr-2" />}
            Actualiser
          </button>
          <button onClick={handleCreateArticle} className="btn btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Article
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-figure text-primary">
            <FileText className="w-8 h-8" />
          </div>
          <div className="stat-title">Total Articles</div>
          <div className="stat-value text-primary">
            {stats?.totalArticles || 0}
          </div>
          <div className="stat-desc">Articles créés</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-figure text-success">
            <Globe className="w-8 h-8" />
          </div>
          <div className="stat-title">Publiés</div>
          <div className="stat-value text-success">
            {stats?.publishedArticles || 0}
          </div>
          <div className="stat-desc">Articles en ligne</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-figure text-warning">
            <Edit className="w-8 h-8" />
          </div>
          <div className="stat-title">Brouillons</div>
          <div className="stat-value text-warning">
            {stats?.draftArticles || 0}
          </div>
          <div className="stat-desc">En cours de rédaction</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-figure text-info">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="stat-title">Vues totales</div>
          <div className="stat-value text-info">
            {(stats?.totalViews || 0).toLocaleString()}
          </div>
          <div className="stat-desc">Lectures cumulées</div>
        </div>
      </div>

      {/* Barre de recherche et contrôles */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Recherche */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="join w-full">
                <input
                  type="text"
                  placeholder="Rechercher des articles..."
                  className="input input-bordered join-item flex-1"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="btn btn-primary join-item">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Actions de sélection multiple */}
            {selectedArticles.length > 0 && (
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedArticles.length} sélectionné(s)
                </span>
                <div className="dropdown dropdown-end">
                  <button tabIndex={0} className="btn btn-sm btn-primary">
                    Actions
                  </button>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                  >
                    <li>
                      <button onClick={() => handleBulkAction("publish")}>
                        Publier
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleBulkAction("draft")}>
                        Mettre en brouillon
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleBulkAction("archive")}>
                        Archiver
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleBulkAction("delete")}
                        className="text-error"
                      >
                        Supprimer
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Contrôles d'affichage */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn btn-sm ${
                  showFilters ? "btn-active" : "btn-outline"
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </button>

              <div className="join">
                <button
                  onClick={() => setViewMode("list")}
                  className={`btn btn-sm join-item ${
                    viewMode === "list" ? "btn-active" : "btn-outline"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`btn btn-sm join-item ${
                    viewMode === "grid" ? "btn-active" : "btn-outline"
                  }`}
                >
                  <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-base-300"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Statut</span>
                  </label>
                  <select
                    className="select select-bordered select-sm"
                    value={filters.status || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value as any,
                        page: 1,
                      }))
                    }
                  >
                    <option value="">Tous les statuts</option>
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                    <option value="archived">Archivé</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Catégorie</span>
                  </label>
                  <select
                    className="select select-bordered select-sm"
                    value={filters.categoryId || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        categoryId: e.target.value || undefined,
                        page: 1,
                      }))
                    }
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Trier par</span>
                  </label>
                  <select
                    className="select select-bordered select-sm"
                    value={filters.sort || "createdAt"}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        sort: e.target.value,
                        page: 1,
                      }))
                    }
                  >
                    <option value="createdAt">Date de création</option>
                    <option value="updatedAt">Date de modification</option>
                    <option value="publishedAt">Date de publication</option>
                    <option value="title">Titre</option>
                    <option value="viewCount">Vues</option>
                    <option value="likesCount">Likes</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Ordre</span>
                  </label>
                  <select
                    className="select select-bordered select-sm"
                    value={filters.order || "desc"}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        order: e.target.value as "asc" | "desc",
                        page: 1,
                      }))
                    }
                  >
                    <option value="desc">Décroissant</option>
                    <option value="asc">Croissant</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Actions</span>
                  </label>
                  <button
                    onClick={() => {
                      setFilters({
                        page: 1,
                        limit: 12,
                        sort: "createdAt",
                        order: "desc",
                      });
                      setSearchTerm("");
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Liste des articles */}
      <div className="card bg-base-100 shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Aucun article trouvé</h3>
            <p className="text-base-content/70 mb-4">
              {searchTerm || filters.status
                ? "Aucun article ne correspond à vos critères."
                : "Commencez par créer votre premier article."}
            </p>
            <button onClick={handleCreateArticle} className="btn btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Créer un article
            </button>
          </div>
        ) : viewMode === "grid" ? (
          // Vue grille
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {articles.map((article) => (
                <motion.div
                  key={article._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-shadow"
                >
                  {/* Image de l'article */}
                  <figure className="relative h-48">
                    {article.featuredImage ? (
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-base-200 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-base-content/30" />
                      </div>
                    )}

                    {/* Checkbox de sélection */}
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={selectedArticles.includes(article._id)}
                        onChange={() => handleSelectArticle(article._id)}
                      />
                    </div>

                    {/* Badge statut */}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(article.status)}
                    </div>

                    {/* Badge featured */}
                    {article.isFeatured && (
                      <div className="absolute bottom-2 left-2">
                        <div className="badge badge-warning">
                          <Star className="w-3 h-3 mr-1" />À la une
                        </div>
                      </div>
                    )}
                  </figure>

                  {/* Contenu de la carte */}
                  <div className="card-body p-4">
                    <h3 className="card-title text-sm font-semibold line-clamp-2 mb-2">
                      {article.title}
                    </h3>

                    {article.excerpt && (
                      <p className="text-xs text-base-content/70 line-clamp-2 mb-3">
                        {article.excerpt}
                      </p>
                    )}

                    {/* Métadonnées */}
                    <div className="flex items-center justify-between text-xs text-base-content/60 mb-3">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(article.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {article.viewCount}
                      </div>
                    </div>

                    {/* Catégorie */}
                    {article.category && (
                      <div className="mb-3">
                        <span
                          className="badge badge-outline badge-xs"
                          style={{ borderColor: article.category.color }}
                        >
                          {article.category.name}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="card-actions justify-end">
                      <button
                        onClick={() => handleEditArticle(article)}
                        className="btn btn-ghost btn-xs"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <div className="dropdown dropdown-end">
                        <button tabIndex={0} className="btn btn-ghost btn-xs">
                          <MoreVertical className="w-3 h-3" />
                        </button>
                        <ul
                          tabIndex={0}
                          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40"
                        >
                          <li>
                            <button
                              onClick={() =>
                                handleStatusChange(article._id, "published")
                              }
                            >
                              Publier
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() =>
                                handleStatusChange(article._id, "draft")
                              }
                            >
                              Brouillon
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() =>
                                handleStatusChange(article._id, "archived")
                              }
                            >
                              Archiver
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => handleDelete(article._id)}
                              className="text-error"
                            >
                              Supprimer
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          // Vue liste
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={
                        selectedArticles.length === articles.length &&
                        articles.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Article</th>
                  <th>Statut</th>
                  <th>Catégorie</th>
                  <th>Statistiques</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <motion.tr
                    key={article._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover"
                  >
                    <td>
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selectedArticles.includes(article._id)}
                        onChange={() => handleSelectArticle(article._id)}
                      />
                    </td>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            {article.featuredImage ? (
                              <img
                                src={article.featuredImage}
                                alt={article.title}
                              />
                            ) : (
                              <div className="bg-base-200 w-full h-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-base-content/30" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            {article.title}
                            {article.isFeatured && (
                              <Star className="w-4 h-4 text-warning" />
                            )}
                          </div>
                          <div className="text-sm opacity-70 truncate max-w-xs">
                            {article.excerpt}
                          </div>
                          {article.author && (
                            <div className="text-xs opacity-50">
                              Par {article.author.username}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{getStatusBadge(article.status)}</td>
                    <td>
                      {article.category ? (
                        <span
                          className="badge badge-outline badge-sm"
                          style={{ borderColor: article.category.color }}
                        >
                          {article.category.name}
                        </span>
                      ) : (
                        <span className="text-base-content/50">Aucune</span>
                      )}
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-sm">
                          <Eye className="w-3 h-3 mr-1" />
                          {article.viewCount.toLocaleString()}
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="w-3 h-3 mr-1" />
                          {article.likesCount}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(article.createdAt)}
                        </div>
                        {article.publishedAt && (
                          <div className="flex items-center text-success">
                            <Globe className="w-3 h-3 mr-1" />
                            {formatDate(article.publishedAt)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditArticle(article)}
                          className="btn btn-sm btn-ghost tooltip"
                          data-tip="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <div className="dropdown dropdown-end">
                          <button tabIndex={0} className="btn btn-sm btn-ghost">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <ul
                            tabIndex={0}
                            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-48"
                          >
                            {article.status !== "published" && (
                              <li>
                                <button
                                  onClick={() =>
                                    handleStatusChange(article._id, "published")
                                  }
                                >
                                  <Globe className="w-4 h-4" />
                                  Publier
                                </button>
                              </li>
                            )}
                            {article.status !== "draft" && (
                              <li>
                                <button
                                  onClick={() =>
                                    handleStatusChange(article._id, "draft")
                                  }
                                >
                                  <Edit className="w-4 h-4" />
                                  Brouillon
                                </button>
                              </li>
                            )}
                            {article.status !== "archived" && (
                              <li>
                                <button
                                  onClick={() =>
                                    handleStatusChange(article._id, "archived")
                                  }
                                >
                                  <Archive className="w-4 h-4" />
                                  Archiver
                                </button>
                              </li>
                            )}
                            <li className="menu-title">
                              <span>Actions</span>
                            </li>
                            <li>
                              <button
                                onClick={() => handleDelete(article._id)}
                                className="text-error"
                              >
                                <Trash2 className="w-4 h-4" />
                                Supprimer
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && articles.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-t border-base-300">
            <div className="text-sm text-base-content/70">
              Affichage de{" "}
              <span className="font-semibold">
                {((pagination?.currentPage || 1) - 1) *
                  (pagination?.itemsPerPage || 12) +
                  1}
              </span>{" "}
              à{" "}
              <span className="font-semibold">
                {Math.min(
                  (pagination?.currentPage || 1) *
                    (pagination?.itemsPerPage || 12),
                  pagination?.totalItems || 0
                )}
              </span>{" "}
              sur{" "}
              <span className="font-semibold">
                {pagination?.totalItems || 0}
              </span>{" "}
              articles
            </div>

            <div className="flex items-center gap-2">
              <button
                className="btn btn-sm btn-outline"
                disabled={!pagination?.hasPrevPage}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))
                }
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </button>

              <div className="join">
                {Array.from(
                  { length: Math.min(5, pagination?.totalPages || 1) },
                  (_, i) => {
                    const pageNum =
                      Math.max(1, (pagination?.currentPage || 1) - 2) + i;
                    if (pageNum > (pagination?.totalPages || 1)) return null;

                    return (
                      <button
                        key={pageNum}
                        className={`join-item btn btn-sm ${
                          pageNum === (pagination?.currentPage || 1)
                            ? "btn-active"
                            : "btn-outline"
                        }`}
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, page: pageNum }))
                        }
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                className="btn btn-sm btn-outline"
                disabled={!pagination?.hasNextPage}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))
                }
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleManagement;
