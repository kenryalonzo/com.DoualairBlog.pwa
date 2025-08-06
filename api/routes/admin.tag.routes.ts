import express from "express";
import {
  createTag,
  getTags,
  getTagById,
  updateTag,
  deleteTag,
  mergeTags,
  cleanupTags,
  getPopularTags,
  getTagCloud,
  getTagStats,
  createMultipleTags
} from "../controllers/admin.tag.controller.js";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import { body, param, query } from "express-validator";

const router = express.Router();

// Validation pour la création de tag
const createTagValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La description ne peut pas dépasser 200 caractères'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('La couleur doit être un code hexadécimal valide')
];

// Validation pour la mise à jour de tag
const updateTagValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID de tag invalide'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La description ne peut pas dépasser 200 caractères'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('La couleur doit être un code hexadécimal valide')
];

// Validation pour les paramètres de requête
const getTagsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un entier positif'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le terme de recherche doit contenir entre 2 et 100 caractères'),
  query('withArticles')
    .optional()
    .isBoolean()
    .withMessage('withArticles doit être un booléen'),
  query('sort')
    .optional()
    .isIn(['name', 'createdAt', 'updatedAt', 'articlesCount', 'popularity'])
    .withMessage('Champ de tri invalide'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Ordre de tri invalide')
];

// Validation pour l'ID de tag
const tagIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID de tag invalide')
];

// Validation pour la fusion de tags
const mergeTagsValidation = [
  body('sourceId')
    .isMongoId()
    .withMessage('ID du tag source invalide'),
  body('targetId')
    .isMongoId()
    .withMessage('ID du tag cible invalide')
];

// Validation pour la création multiple de tags
const createMultipleTagsValidation = [
  body('names')
    .isArray({ min: 1 })
    .withMessage('Une liste de noms de tags est requise'),
  body('names.*')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Chaque nom de tag doit contenir entre 2 et 50 caractères')
];

// Validation pour les limites
const limitValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100')
];

// Routes protégées par authentification et rôle admin
router.use(verifyToken, requireAdmin);

// POST /api/admin/tags - Créer un nouveau tag
router.post(
  '/',
  createTagValidation,
  validateRequest,
  createTag
);

// POST /api/admin/tags/multiple - Créer plusieurs tags en une fois
router.post(
  '/multiple',
  createMultipleTagsValidation,
  validateRequest,
  createMultipleTags
);

// GET /api/admin/tags - Obtenir tous les tags avec filtres
router.get(
  '/',
  getTagsValidation,
  validateRequest,
  getTags
);

// GET /api/admin/tags/popular - Obtenir les tags populaires
router.get(
  '/popular',
  limitValidation,
  validateRequest,
  getPopularTags
);

// GET /api/admin/tags/cloud - Obtenir le nuage de tags
router.get(
  '/cloud',
  limitValidation,
  validateRequest,
  getTagCloud
);

// GET /api/admin/tags/stats - Obtenir les statistiques des tags
router.get(
  '/stats',
  getTagStats
);

// POST /api/admin/tags/cleanup - Nettoyer les tags inutilisés
router.post(
  '/cleanup',
  cleanupTags
);

// POST /api/admin/tags/merge - Fusionner deux tags
router.post(
  '/merge',
  mergeTagsValidation,
  validateRequest,
  mergeTags
);

// GET /api/admin/tags/:id - Obtenir un tag par ID
router.get(
  '/:id',
  tagIdValidation,
  validateRequest,
  getTagById
);

// PUT /api/admin/tags/:id - Mettre à jour un tag
router.put(
  '/:id',
  updateTagValidation,
  validateRequest,
  updateTag
);

// DELETE /api/admin/tags/:id - Supprimer un tag
router.delete(
  '/:id',
  tagIdValidation,
  validateRequest,
  deleteTag
);

export default router;
