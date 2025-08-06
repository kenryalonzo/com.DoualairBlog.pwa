import { Request, Response } from "express";
import Article from "../models/article.model.js";
import Category from "../models/category.model.js";
import Tag from "../models/tag.model.js";
import { AuthRequest, ControllerFunction } from "../types/index.js";
import { createError } from "../utils/error.js";

// Obtenir les articles pour la page d'accueil
export const getHomeArticles: ControllerFunction = async (
  req: Request,
  res: Response
) => {
  try {
    const [featuredArticle, recentArticles, popularArticles, categories] = await Promise.all([
      // Article à la une (le plus récent avec isFeatured = true)
      Article.findOne({ status: 'published', isFeatured: true })
        .sort({ publishedAt: -1 })
        .populate('author', 'username avatar')
        .populate('category', 'name slug color')
        .populate('tagDetails', 'name slug color'),

      // Articles récents (6 derniers articles publiés)
      Article.find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .limit(6)
        .populate('author', 'username avatar')
        .populate('category', 'name slug color')
        .select('title slug excerpt featuredImage featuredVideo videoType publishedAt viewCount likesCount'),

      // Articles populaires (basés sur les vues)
      Article.find({ status: 'published' })
        .sort({ viewCount: -1, publishedAt: -1 })
        .limit(4)
        .populate('author', 'username avatar')
        .populate('category', 'name slug color')
        .select('title slug excerpt featuredImage featuredVideo videoType publishedAt viewCount likesCount'),

      // Catégories populaires
      Category.findPopular(6)
    ]);

    res.json({
      success: true,
      data: {
        featured: featuredArticle,
        recent: recentArticles,
        popular: popularArticles,
        categories
      }
    });
  } catch (error) {
    throw error;
  }
};

// Obtenir les articles publiés avec pagination
export const getPublishedArticles: ControllerFunction = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      page = '1',
      limit = '12',
      category,
      tag,
      search,
      sort = 'publishedAt',
      order = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Construire les filtres
    const filters: any = {
      status: 'published',
      publishedAt: { $lte: new Date() }
    };

    // Filtrer par catégorie
    if (category) {
      const categoryDoc = await Category.findBySlug(category as string);
      if (categoryDoc) {
        filters.categoryId = categoryDoc._id;
      }
    }

    // Filtrer par tag
    if (tag) {
      const tagDoc = await Tag.findBySlug(tag as string);
      if (tagDoc) {
        filters.tags = tagDoc._id;
      }
    }

    // Recherche textuelle
    if (search) {
      filters.$text = { $search: search as string };
    }

    // Construire le tri
    const sortObj: any = {};
    sortObj[sort as string] = order === 'asc' ? 1 : -1;

    // Exécuter la requête
    const [articles, total] = await Promise.all([
      Article.find(filters)
        .populate('author', 'username avatar')
        .populate('category', 'name slug color')
        .populate('tagDetails', 'name slug color')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .select('-content'), // Exclure le contenu complet pour la liste
      Article.countDocuments(filters)
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
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    throw error;
  }
};

// Obtenir un article par slug
export const getArticleBySlug: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { slug } = req.params;

    const article = await Article.findOne({ 
      slug, 
      status: 'published',
      publishedAt: { $lte: new Date() }
    })
      .populate('author', 'username avatar email')
      .populate('category', 'name slug color description')
      .populate('tagDetails', 'name slug color');

    if (!article) {
      throw createError(404, "Article non trouvé");
    }

    // Incrémenter le compteur de vues
    article.viewCount += 1;
    await article.save();

    // Obtenir les articles similaires (même catégorie ou tags similaires)
    const similarArticles = await Article.find({
      _id: { $ne: article._id },
      status: 'published',
      $or: [
        { categoryId: article.categoryId },
        { tags: { $in: article.tags } }
      ]
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .populate('author', 'username avatar')
      .populate('category', 'name slug color')
      .select('title slug excerpt featuredImage featuredVideo videoType publishedAt viewCount');

    // Vérifier si l'utilisateur a liké ou mis en favoris l'article
    let userInteractions = null;
    if (req.user) {
      // Cette partie sera implémentée avec le système d'interactions
      userInteractions = {
        isLiked: false,
        isFavorited: false
      };
    }

    res.json({
      success: true,
      data: {
        article,
        similarArticles,
        userInteractions
      }
    });
  } catch (error) {
    throw error;
  }
};

// Rechercher des articles
export const searchArticles: ControllerFunction = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      q: query,
      page = '1',
      limit = '10',
      category,
      tag
    } = req.query;

    if (!query) {
      throw createError(400, "Terme de recherche requis");
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Construire les filtres
    const filters: any = {
      $text: { $search: query as string },
      status: 'published',
      publishedAt: { $lte: new Date() }
    };

    // Filtres additionnels
    if (category) {
      const categoryDoc = await Category.findBySlug(category as string);
      if (categoryDoc) {
        filters.categoryId = categoryDoc._id;
      }
    }

    if (tag) {
      const tagDoc = await Tag.findBySlug(tag as string);
      if (tagDoc) {
        filters.tags = tagDoc._id;
      }
    }

    // Exécuter la recherche
    const [articles, total] = await Promise.all([
      Article.find(filters, { score: { $meta: 'textScore' } })
        .populate('author', 'username avatar')
        .populate('category', 'name slug color')
        .populate('tagDetails', 'name slug color')
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limitNum)
        .select('-content'),
      Article.countDocuments(filters)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        articles,
        query,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    throw error;
  }
};

// Obtenir les articles par catégorie
export const getArticlesByCategory: ControllerFunction = async (
  req: Request,
  res: Response
) => {
  try {
    const { slug } = req.params;
    const {
      page = '1',
      limit = '12',
      sort = 'publishedAt',
      order = 'desc'
    } = req.query;

    const category = await Category.findBySlug(slug);
    if (!category) {
      throw createError(404, "Catégorie non trouvée");
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Construire le tri
    const sortObj: any = {};
    sortObj[sort as string] = order === 'asc' ? 1 : -1;

    // Obtenir les articles de cette catégorie
    const [articles, total] = await Promise.all([
      Article.find({
        categoryId: category._id,
        status: 'published',
        publishedAt: { $lte: new Date() }
      })
        .populate('author', 'username avatar')
        .populate('tagDetails', 'name slug color')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .select('-content'),
      Article.countDocuments({
        categoryId: category._id,
        status: 'published',
        publishedAt: { $lte: new Date() }
      })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        category,
        articles,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    throw error;
  }
};

// Obtenir les articles par tag
export const getArticlesByTag: ControllerFunction = async (
  req: Request,
  res: Response
) => {
  try {
    const { slug } = req.params;
    const {
      page = '1',
      limit = '12',
      sort = 'publishedAt',
      order = 'desc'
    } = req.query;

    const tag = await Tag.findBySlug(slug);
    if (!tag) {
      throw createError(404, "Tag non trouvé");
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Construire le tri
    const sortObj: any = {};
    sortObj[sort as string] = order === 'asc' ? 1 : -1;

    // Obtenir les articles avec ce tag
    const [articles, total] = await Promise.all([
      Article.find({
        tags: tag._id,
        status: 'published',
        publishedAt: { $lte: new Date() }
      })
        .populate('author', 'username avatar')
        .populate('category', 'name slug color')
        .populate('tagDetails', 'name slug color')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .select('-content'),
      Article.countDocuments({
        tags: tag._id,
        status: 'published',
        publishedAt: { $lte: new Date() }
      })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        tag,
        articles,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    throw error;
  }
};
