import { Router } from "express";

const router = Router();

// Routes de test pour vérifier que le système fonctionne
router.get("/test", (_req, res) => {
  res.json({ 
    success: true, 
    message: "Routes du blog fonctionnelles",
    timestamp: new Date().toISOString()
  });
});

// Route pour les statistiques générales
router.get("/stats", (_req, res) => {
  res.json({
    success: true,
    data: {
      articles: 0,
      categories: 0,
      tags: 0,
      views: 0
    }
  });
});

export default router;
