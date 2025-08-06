import express from "express";
import { body, param, query } from "express-validator";
import {
  createArticle,
  deleteArticle,
  getArticleById,
  getArticles,
  getArticleStats,
  togglePublishArticle,
  updateArticle,
} from "../controllers/admin.article.controller.js";
import { validateRequest } from "../middleware/validation.middleware.js";

const router = express.Router();

// Validation pour la création d'article
const createArticleValidation = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Le titre doit contenir entre 3 et 200 caractères"),
  body("content")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Le contenu doit contenir au moins 10 caractères"),
  body("excerpt")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("L'extrait ne peut pas dépasser 500 caractères"),
  body("status")
    .optional()
    .isIn(["draft", "published", "archived"])
    .withMessage("Statut invalide"),
  body("categoryId")
    .optional()
    .isMongoId()
    .withMessage("ID de catégorie invalide"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Les tags doivent être un tableau"),
  body("tags.*")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Chaque tag doit contenir entre 2 et 50 caractères"),
  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured doit être un booléen"),
  body("featuredImage")
    .optional()
    .trim()
    .isURL()
    .withMessage("L'image à la une doit être une URL valide"),
  body("featuredVideo")
    .optional()
    .trim()
    .isURL()
    .withMessage("La vidéo à la une doit être une URL valide"),
  body("videoType")
    .optional()
    .isIn(["upload", "youtube", "vimeo", "url"])
    .withMessage("Type de vidéo invalide"),
  body("seoTitle")
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage("Le titre SEO ne peut pas dépasser 60 caractères"),
  body("seoDescription")
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage("La description SEO ne peut pas dépasser 160 caractères"),
  body("seoKeywords")
    .optional()
    .isArray()
    .withMessage("Les mots-clés SEO doivent être un tableau"),
  body("seoKeywords.*")
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage("Chaque mot-clé SEO doit contenir entre 2 et 30 caractères"),
];

// Validation pour la mise à jour d'article
const updateArticleValidation = [
  param("id").isMongoId().withMessage("ID d'article invalide"),
  ...createArticleValidation.map((validation) => validation.optional()),
];

// Validation pour les paramètres de requête
const getArticlesValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Le numéro de page doit être un entier positif"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("La limite doit être entre 1 et 100"),
  query("status")
    .optional()
    .isIn(["draft", "published", "archived"])
    .withMessage("Statut invalide"),
  query("categoryId")
    .optional()
    .isMongoId()
    .withMessage("ID de catégorie invalide"),
  query("authorId").optional().isMongoId().withMessage("ID d'auteur invalide"),
  query("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured doit être un booléen"),
  query("sort")
    .optional()
    .isIn([
      "title",
      "createdAt",
      "updatedAt",
      "publishedAt",
      "viewCount",
      "likesCount",
    ])
    .withMessage("Champ de tri invalide"),
  query("order")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Ordre de tri invalide"),
];

// Validation pour l'ID d'article
const articleIdValidation = [
  param("id").isMongoId().withMessage("ID d'article invalide"),
];

// Validation pour le changement de statut
const togglePublishValidation = [
  param("id").isMongoId().withMessage("ID d'article invalide"),
  body("status")
    .isIn(["draft", "published", "archived"])
    .withMessage("Statut invalide"),
];

// Routes protégées par authentification et rôle admin
// TODO: Réactiver en production
// router.use(verifyToken, requireAdmin);

// POST /api/admin/articles - Créer un nouvel article
router.post("/", createArticleValidation, validateRequest, createArticle);

// GET /api/admin/articles - Obtenir tous les articles avec filtres
router.get("/", getArticlesValidation, validateRequest, getArticles);

// GET /api/admin/articles/stats - Obtenir les statistiques des articles
router.get("/stats", getArticleStats);

// GET /api/admin/articles/:id - Obtenir un article par ID
router.get("/:id", articleIdValidation, validateRequest, getArticleById);

// PUT /api/admin/articles/:id - Mettre à jour un article
router.put("/:id", updateArticleValidation, validateRequest, updateArticle);

// DELETE /api/admin/articles/:id - Supprimer un article
router.delete("/:id", articleIdValidation, validateRequest, deleteArticle);

// PATCH /api/admin/articles/:id/status - Changer le statut d'un article
router.patch(
  "/:id/status",
  togglePublishValidation,
  validateRequest,
  togglePublishArticle
);

export default router;
