import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryHierarchy,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  getCategoryStats
} from "../controllers/admin.category.controller.js";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import { body, param, query } from "express-validator";

const router = express.Router();

// Validation pour la création de catégorie
const createCategoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('La couleur doit être un code hexadécimal valide'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('L\'icône ne peut pas dépasser 50 caractères'),
  body('parentId')
    .optional()
    .isMongoId()
    .withMessage('ID de catégorie parent invalide')
];

// Validation pour la mise à jour de catégorie
const updateCategoryValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID de catégorie invalide'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('La couleur doit être un code hexadécimal valide'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('L\'icône ne peut pas dépasser 50 caractères'),
  body('parentId')
    .optional()
    .isMongoId()
    .withMessage('ID de catégorie parent invalide'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive doit être un booléen')
];

// Validation pour les paramètres de requête
const getCategoriesValidation = [
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
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive doit être un booléen'),
  query('parentId')
    .optional()
    .custom((value) => {
      if (value === 'null') return true;
      if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('ID de catégorie parent invalide');
      }
      return true;
    }),
  query('sort')
    .optional()
    .isIn(['name', 'createdAt', 'updatedAt', 'articlesCount'])
    .withMessage('Champ de tri invalide'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Ordre de tri invalide')
];

// Validation pour l'ID de catégorie
const categoryIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID de catégorie invalide')
];

// Validation pour le changement de statut
const toggleStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID de catégorie invalide'),
  body('isActive')
    .isBoolean()
    .withMessage('isActive doit être un booléen')
];

// Routes protégées par authentification et rôle admin
router.use(verifyToken, requireAdmin);

// POST /api/admin/categories - Créer une nouvelle catégorie
router.post(
  '/',
  createCategoryValidation,
  validateRequest,
  createCategory
);

// GET /api/admin/categories - Obtenir toutes les catégories avec filtres
router.get(
  '/',
  getCategoriesValidation,
  validateRequest,
  getCategories
);

// GET /api/admin/categories/hierarchy - Obtenir la hiérarchie des catégories
router.get(
  '/hierarchy',
  getCategoryHierarchy
);

// GET /api/admin/categories/stats - Obtenir les statistiques des catégories
router.get(
  '/stats',
  getCategoryStats
);

// GET /api/admin/categories/:id - Obtenir une catégorie par ID
router.get(
  '/:id',
  categoryIdValidation,
  validateRequest,
  getCategoryById
);

// PUT /api/admin/categories/:id - Mettre à jour une catégorie
router.put(
  '/:id',
  updateCategoryValidation,
  validateRequest,
  updateCategory
);

// DELETE /api/admin/categories/:id - Supprimer une catégorie
router.delete(
  '/:id',
  categoryIdValidation,
  validateRequest,
  deleteCategory
);

// PATCH /api/admin/categories/:id/status - Changer le statut d'une catégorie
router.patch(
  '/:id/status',
  toggleStatusValidation,
  validateRequest,
  toggleCategoryStatus
);

export default router;
