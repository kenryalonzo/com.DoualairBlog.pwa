import express from "express";
import {
  getArticles,
  getArticleStats,
  createArticle,
  getArticleById,
  updateArticle,
  deleteArticle
} from "../controllers/simple.article.controller.js";

const router = express.Router();

// Routes publiques (sans authentification pour le moment)

// GET /api/admin/articles - Obtenir tous les articles avec filtres
router.get('/', getArticles);

// GET /api/admin/articles/stats - Obtenir les statistiques
router.get('/stats', getArticleStats);

// GET /api/admin/articles/:id - Obtenir un article par ID
router.get('/:id', getArticleById);

// POST /api/admin/articles - Créer un nouvel article
router.post('/', createArticle);

// PUT /api/admin/articles/:id - Mettre à jour un article
router.put('/:id', updateArticle);

// DELETE /api/admin/articles/:id - Supprimer un article
router.delete('/:id', deleteArticle);

export default router;
