import express from "express";
import {
  getHomeArticles,
  getPublishedArticles,
  getArticleBySlug,
  searchArticles,
  getArticlesByCategory,
  getArticlesByTag
} from "../controllers/public.article.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import { param, query } from "express-validator";

const router = express.Router();

// Validation pour les paramètres de pagination
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un entier positif'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('La limite doit être entre 1 et 50')
];

// Validation pour les paramètres de tri
const sortValidation = [
  query('sort')
    .optional()
    .isIn(['publishedAt', 'viewCount', 'likesCount', 'title'])
    .withMessage('Champ de tri invalide'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Ordre de tri invalide')
];

// Validation pour la recherche
const searchValidation = [
  query('q')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le terme de recherche doit contenir entre 2 et 100 caractères'),
  query('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le slug de catégorie doit contenir entre 2 et 50 caractères'),
  query('tag')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le slug de tag doit contenir entre 2 et 50 caractères'),
  ...paginationValidation
];

// Validation pour les slugs
const slugValidation = [
  param('slug')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le slug doit contenir entre 2 et 100 caractères')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets')
];

// Validation pour les articles publiés
const publishedArticlesValidation = [
  query('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le slug de catégorie doit contenir entre 2 et 50 caractères'),
  query('tag')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le slug de tag doit contenir entre 2 et 50 caractères'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le terme de recherche doit contenir entre 2 et 100 caractères'),
  ...paginationValidation,
  ...sortValidation
];

// GET /api/articles/home - Obtenir les articles pour la page d'accueil
router.get(
  '/home',
  getHomeArticles
);

// GET /api/articles - Obtenir les articles publiés avec filtres et pagination
router.get(
  '/',
  publishedArticlesValidation,
  validateRequest,
  getPublishedArticles
);

// GET /api/articles/search - Rechercher des articles
router.get(
  '/search',
  searchValidation,
  validateRequest,
  searchArticles
);

// GET /api/articles/category/:slug - Obtenir les articles d'une catégorie
router.get(
  '/category/:slug',
  [
    ...slugValidation,
    ...paginationValidation,
    ...sortValidation
  ],
  validateRequest,
  getArticlesByCategory
);

// GET /api/articles/tag/:slug - Obtenir les articles d'un tag
router.get(
  '/tag/:slug',
  [
    ...slugValidation,
    ...paginationValidation,
    ...sortValidation
  ],
  validateRequest,
  getArticlesByTag
);

// GET /api/articles/:slug - Obtenir un article par slug (avec auth optionnelle)
router.get(
  '/:slug',
  slugValidation,
  validateRequest,
  optionalAuth,
  getArticleBySlug
);

export default router;
