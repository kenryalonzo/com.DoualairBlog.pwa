import { Response } from "express";
import Article from "../models/article.model.js";
import Category from "../models/category.model.js";
import Tag from "../models/tag.model.js";
import { AuthRequest, ControllerFunction } from "../types/index.js";
import { createError } from "../utils/error.js";

// Créer un nouvel article
export const createArticle: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      title,
      content,
      excerpt,
      featuredImage,
      featuredVideo,
      videoType,
      categoryId,
      tags,
      status = "draft",
      isFeatured = false,
      seoTitle,
      seoDescription,
      seoKeywords,
    } = req.body;

    // Validation des champs requis
    if (!title || !content) {
      throw createError(400, "Le titre et le contenu sont requis");
    }

    // Vérifier que la catégorie existe si fournie
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        throw createError(404, "Catégorie non trouvée");
      }
    }

    // Traiter les tags
    let tagIds: string[] = [];
    if (tags && Array.isArray(tags)) {
      const tagObjects = await Tag.findOrCreate(tags);
      tagIds = tagObjects.map((tag) => (tag._id as any).toString());
    }

    // Créer l'article
    const article = new Article({
      title,
      content,
      excerpt,
      featuredImage,
      featuredVideo,
      videoType,
      authorId: req.user!.id,
      categoryId: categoryId || null,
      tags: tagIds,
      status,
      isFeatured,
      seoTitle,
      seoDescription,
      seoKeywords: seoKeywords || [],
    });

    await article.save();

    // Populer les relations pour la réponse
    await article.populate([
      { path: "author", select: "username avatar" },
      { path: "category", select: "name slug color" },
      { path: "tagDetails", select: "name slug color" },
    ]);

    res.status(201).json({
      success: true,
      message: "Article créé avec succès",
      data: { article },
    });
  } catch (error) {
    throw error;
  }
};

// Obtenir tous les articles (admin)
export const getArticles: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      page = "1",
      limit = "10",
      status,
      categoryId,
      tags,
      authorId,
      isFeatured,
      search,
      dateFrom,
      dateTo,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Construire les filtres
    const filters: any = {};

    if (status) filters.status = status;
    if (categoryId) filters.categoryId = categoryId;
    if (authorId) filters.authorId = authorId;
    if (isFeatured !== undefined) filters.isFeatured = isFeatured === "true";

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      const tagObjects = await Tag.find({ slug: { $in: tagArray } });
      if (tagObjects.length > 0) {
        filters.tags = { $in: tagObjects.map((tag) => tag._id) };
      }
    }

    if (dateFrom || dateTo) {
      filters.createdAt = {};
      if (dateFrom) filters.createdAt.$gte = new Date(dateFrom as string);
      if (dateTo) filters.createdAt.$lte = new Date(dateTo as string);
    }

    if (search) {
      filters.$text = { $search: search as string };
    }

    // Construire le tri
    const sortObj: any = {};
    sortObj[sort as string] = order === "asc" ? 1 : -1;

    // Exécuter la requête
    const [articles, total] = await Promise.all([
      Article.find(filters)
        .populate("author", "username avatar")
        .populate("category", "name slug color")
        .populate("tagDetails", "name slug color")
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Article.countDocuments(filters),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    throw error;
  }
};

// Obtenir un article par ID
export const getArticleById: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id)
      .populate("author", "username avatar email")
      .populate("category", "name slug color description")
      .populate("tagDetails", "name slug color");

    if (!article) {
      throw createError(404, "Article non trouvé");
    }

    res.json({
      success: true,
      data: { article },
    });
  } catch (error) {
    throw error;
  }
};

// Mettre à jour un article
export const updateArticle: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const article = await Article.findById(id);
    if (!article) {
      throw createError(404, "Article non trouvé");
    }

    // Vérifier les permissions
    if (!article.canBeEditedBy(req.user!.id, req.user!.role)) {
      throw createError(
        403,
        "Vous n'avez pas l'autorisation de modifier cet article"
      );
    }

    // Vérifier la catégorie si fournie
    if (updateData.categoryId) {
      const category = await Category.findById(updateData.categoryId);
      if (!category) {
        throw createError(404, "Catégorie non trouvée");
      }
    }

    // Traiter les tags si fournis
    if (updateData.tags && Array.isArray(updateData.tags)) {
      const tagObjects = await Tag.findOrCreate(updateData.tags);
      updateData.tags = tagObjects.map((tag) => tag._id);
    }

    // Mettre à jour l'article
    Object.assign(article, updateData);
    await article.save();

    // Populer les relations pour la réponse
    await article.populate([
      { path: "author", select: "username avatar" },
      { path: "category", select: "name slug color" },
      { path: "tagDetails", select: "name slug color" },
    ]);

    res.json({
      success: true,
      message: "Article mis à jour avec succès",
      data: { article },
    });
  } catch (error) {
    throw error;
  }
};

// Supprimer un article
export const deleteArticle: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      throw createError(404, "Article non trouvé");
    }

    // Vérifier les permissions
    if (!article.canBeEditedBy(req.user!.id, req.user!.role)) {
      throw createError(
        403,
        "Vous n'avez pas l'autorisation de supprimer cet article"
      );
    }

    await article.deleteOne();

    res.json({
      success: true,
      message: "Article supprimé avec succès",
    });
  } catch (error) {
    throw error;
  }
};

// Publier/dépublier un article
export const togglePublishArticle: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["draft", "published", "archived"].includes(status)) {
      throw createError(400, "Statut invalide");
    }

    const article = await Article.findById(id);
    if (!article) {
      throw createError(404, "Article non trouvé");
    }

    // Vérifier les permissions
    if (!article.canBeEditedBy(req.user!.id, req.user!.role)) {
      throw createError(
        403,
        "Vous n'avez pas l'autorisation de modifier cet article"
      );
    }

    article.status = status;
    if (status === "published" && !article.publishedAt) {
      article.publishedAt = new Date();
    }

    await article.save();

    res.json({
      success: true,
      message: `Article ${
        status === "published"
          ? "publié"
          : status === "archived"
          ? "archivé"
          : "mis en brouillon"
      } avec succès`,
      data: { article },
    });
  } catch (error) {
    throw error;
  }
};

// Obtenir les statistiques des articles
export const getArticleStats: ControllerFunction = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      archivedArticles,
      totalViews,
      totalLikes,
      totalComments,
      recentArticles,
    ] = await Promise.all([
      Article.countDocuments(),
      Article.countDocuments({ status: "published" }),
      Article.countDocuments({ status: "draft" }),
      Article.countDocuments({ status: "archived" }),
      Article.aggregate([
        { $group: { _id: null, total: { $sum: "$viewCount" } } },
      ]),
      Article.aggregate([
        { $group: { _id: null, total: { $sum: "$likesCount" } } },
      ]),
      Article.aggregate([
        { $group: { _id: null, total: { $sum: "$commentsCount" } } },
      ]),
      Article.find({ status: "published" })
        .sort({ publishedAt: -1 })
        .limit(5)
        .populate("author", "username")
        .select("title slug viewCount likesCount publishedAt"),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalArticles,
          publishedArticles,
          draftArticles,
          archivedArticles,
          totalViews: totalViews[0]?.total || 0,
          totalLikes: totalLikes[0]?.total || 0,
          totalComments: totalComments[0]?.total || 0,
        },
        recentArticles,
      },
    });
  } catch (error) {
    throw error;
  }
};
