import { Request, Response } from "express";
import Article from "../models/article.model.js";

// Obtenir tous les articles avec pagination
export const getArticles = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const status = req.query.status as string;
    const search = req.query.search as string;
    const categoryId = req.query.categoryId as string;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "desc";

    // Construction du filtre
    const filter: any = {};

    if (status && ["draft", "published", "archived"].includes(status)) {
      filter.status = status;
    }

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    // Construction du tri
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Exécution des requêtes
    const [articles, totalItems] = await Promise.all([
      Article.find(filter)
        .populate("categoryId", "name slug color")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des articles:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des articles",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Obtenir les statistiques des articles
export const getArticleStats = async (req: Request, res: Response) => {
  try {
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      archivedArticles,
      recentArticles,
    ] = await Promise.all([
      Article.countDocuments(),
      Article.countDocuments({ status: "published" }),
      Article.countDocuments({ status: "draft" }),
      Article.countDocuments({ status: "archived" }),
      Article.find({ status: "published" })
        .populate("categoryId", "name slug color")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Calculer les vues totales (somme de toutes les vues)
    const viewsResult = await Article.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);
    const totalViews = viewsResult[0]?.totalViews || 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalArticles,
          publishedArticles,
          draftArticles,
          archivedArticles,
          totalViews,
          totalLikes: 0, // À implémenter plus tard
          totalComments: 0, // À implémenter plus tard
        },
        recentArticles,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Créer un nouvel article
export const createArticle = async (req: Request, res: Response) => {
  try {
    const {
      title,
      content,
      excerpt,
      featuredImage,
      categoryId,
      tags = [],
      status = "draft",
      isFeatured = false,
      seoTitle,
      seoDescription,
      seoKeywords,
    } = req.body;

    // Validation basique
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Le titre et le contenu sont requis",
      });
    }

    // Générer un slug à partir du titre
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Vérifier l'unicité du slug
    let finalSlug = slug;
    let counter = 1;
    while (await Article.findOne({ slug: finalSlug })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const article = new Article({
      title,
      slug: finalSlug,
      content,
      excerpt,
      featuredImage,
      categoryId: categoryId || null,
      tags,
      status,
      isFeatured,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt,
      seoKeywords: seoKeywords || [],
      views: 0,
      authorId: "507f1f77bcf86cd799439011", // ID temporaire pour les tests
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedArticle = await article.save();

    // Populer les références pour la réponse
    await savedArticle.populate("categoryId", "name slug color");

    res.status(201).json({
      success: true,
      data: {
        article: savedArticle,
      },
      message: "Article créé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'article:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de l'article",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Obtenir un article par ID
export const getArticleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id)
      .populate("categoryId", "name slug color")
      .lean();

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article non trouvé",
      });
    }

    res.json({
      success: true,
      data: {
        article,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'article",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Mettre à jour un article
export const updateArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Mettre à jour la date de modification
    updateData.updatedAt = new Date();

    const article = await Article.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("categoryId", "name slug color");

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article non trouvé",
      });
    }

    res.json({
      success: true,
      data: {
        article,
      },
      message: "Article mis à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'article:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de l'article",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Supprimer un article
export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const article = await Article.findByIdAndDelete(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article non trouvé",
      });
    }

    res.json({
      success: true,
      message: "Article supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'article:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l'article",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};
