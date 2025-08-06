import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Application, NextFunction, Request, Response } from "express";
import fs from "fs";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import {
  generalLimiter,
  helmetConfig,
  logSuspiciousRequests,
  sanitizeInput,
  securityHeaders,
  validateContentType,
  validateRequestSize,
} from "./middleware/security.middleware.js";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import { AppError, DatabaseConfig, ServerConfig } from "./types/index.js";

// Initialiser tous les modèles Mongoose
import "./models/index.js";
import { startCleanupScheduler } from "./utils/cleanup.utils.js";

// Charger les variables d'environnement
dotenv.config();

// Configuration du serveur
const serverConfig: ServerConfig = {
  port: parseInt(process.env["PORT"] || "3000"),
  nodeEnv: process.env["NODE_ENV"] || "development",
  corsOrigin: process.env["CORS_ORIGIN"] || [
    "http://localhost:5173",
    "http://localhost:3000",
  ],
};

// Configuration de la base de données
const databaseConfig: DatabaseConfig = {
  uri: process.env["MONGO_URI"] || "",
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};

// Vérifier les variables d'environnement requises
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Erreur : ${envVar} non défini dans le fichier .env`);
    process.exit(1);
  }
}

// Initialiser l'application Express
const app: Application = express();

// Configuration CORS
app.use(
  cors({
    origin: serverConfig.corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Middleware de sécurité
app.use(helmetConfig);
app.use(securityHeaders);
app.use(logSuspiciousRequests);

// Middleware de rate limiting
app.use(generalLimiter);

// Middleware pour parser les cookies et JSON
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware de validation et nettoyage
app.use(validateContentType);
app.use(validateRequestSize);
app.use(sanitizeInput);

// Configuration multer pour l'upload d'images
const uploadDir = path.join(process.cwd(), "uploads", "images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const prefix = file.mimetype.startsWith("video/") ? "video" : "image";
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max pour les vidéos
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Seules les images et vidéos sont autorisées"));
    }
  },
});

// Servir les fichiers uploadés
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);

// Routes du système de blog (temporaires pour test)
app.get("/api/blog/test", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Routes du blog fonctionnelles",
    timestamp: new Date().toISOString(),
  });
});

// Routes des articles - implémentation directe
app.get("/api/admin/articles", async (_req: Request, res: Response) => {
  try {
    // Import dynamique du contrôleur
    const { getArticles } = await import(
      "./controllers/simple.article.controller.js"
    );
    await getArticles(_req, res);
  } catch (error) {
    console.error("Erreur lors de l'exécution du contrôleur articles:", error);
    res.json({
      success: true,
      data: {
        articles: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 12,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
      message: "Endpoint de fallback - base de données non connectée",
    });
  }
});

app.get("/api/admin/articles/stats", async (_req: Request, res: Response) => {
  try {
    const { getArticleStats } = await import(
      "./controllers/simple.article.controller.js"
    );
    await getArticleStats(_req, res);
  } catch (error) {
    console.error("Erreur lors de l'exécution du contrôleur stats:", error);
    res.json({
      success: true,
      data: {
        stats: {
          totalArticles: 0,
          publishedArticles: 0,
          draftArticles: 0,
          archivedArticles: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
        },
        recentArticles: [],
      },
      message: "Endpoint de fallback - base de données non connectée",
    });
  }
});

app.post("/api/admin/articles", async (req: Request, res: Response) => {
  try {
    const { createArticle } = await import(
      "./controllers/simple.article.controller.js"
    );
    await createArticle(req, res);
  } catch (error) {
    console.error("Erreur lors de la création d'article:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de l'article",
    });
  }
});

// Routes des catégories avec vrais contrôleurs
app.get("/api/admin/categories", async (req: Request, res: Response) => {
  try {
    const { getCategories } = await import(
      "./controllers/simple.category.controller.js"
    );
    await getCategories(req, res);
  } catch (error) {
    console.error(
      "Erreur lors de l'exécution du contrôleur catégories:",
      error
    );
    res.json({
      success: true,
      data: {
        categories: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 100,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
      message: "Endpoint de fallback - base de données non connectée",
    });
  }
});

app.post("/api/admin/categories", async (req: Request, res: Response) => {
  try {
    const { createCategory } = await import(
      "./controllers/simple.category.controller.js"
    );
    await createCategory(req, res);
  } catch (error) {
    console.error("Erreur lors de la création de catégorie:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de la catégorie",
    });
  }
});

app.get("/api/admin/categories/stats", async (_req: Request, res: Response) => {
  try {
    const { getCategoryStats } = await import(
      "./controllers/simple.category.controller.js"
    );
    await getCategoryStats(_req, res);
  } catch (error) {
    console.error("Erreur lors des statistiques catégories:", error);
    res.json({
      success: true,
      data: {
        stats: {
          totalCategories: 0,
          activeCategories: 0,
          inactiveCategories: 0,
        },
      },
      message: "Endpoint de fallback - base de données non connectée",
    });
  }
});

// Routes des tags avec vrais contrôleurs
app.get("/api/admin/tags", async (req: Request, res: Response) => {
  try {
    const { getTags } = await import("./controllers/simple.tag.controller.js");
    await getTags(req, res);
  } catch (error) {
    console.error("Erreur lors de l'exécution du contrôleur tags:", error);
    res.json({
      success: true,
      data: {
        tags: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 100,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
      message: "Endpoint de fallback - base de données non connectée",
    });
  }
});

app.post("/api/admin/tags", async (req: Request, res: Response) => {
  try {
    const { createTag } = await import(
      "./controllers/simple.tag.controller.js"
    );
    await createTag(req, res);
  } catch (error) {
    console.error("Erreur lors de la création de tag:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du tag",
    });
  }
});

app.get("/api/admin/tags/stats", async (_req: Request, res: Response) => {
  try {
    const { getTagStats } = await import(
      "./controllers/simple.tag.controller.js"
    );
    await getTagStats(_req, res);
  } catch (error) {
    console.error("Erreur lors des statistiques tags:", error);
    res.json({
      success: true,
      data: {
        stats: {
          totalTags: 0,
        },
      },
      message: "Endpoint de fallback - base de données non connectée",
    });
  }
});

// Route de santé
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Serveur opérationnel",
    timestamp: new Date().toISOString(),
    environment: serverConfig.nodeEnv,
  });
});

// Route pour générer un token de test (développement uniquement)
app.get("/api/auth/test-token", async (req: Request, res: Response) => {
  if (serverConfig.nodeEnv !== "development") {
    return res.status(403).json({
      success: false,
      message: "Endpoint disponible uniquement en développement",
    });
  }

  const jwt = (await import("jsonwebtoken")).default;
  const testUser = {
    id: "507f1f77bcf86cd799439011",
    email: "admin@test.com",
    role: "admin",
    username: "admin",
  };

  const token = jwt.sign(testUser, process.env.JWT_SECRET || "test-secret", {
    expiresIn: "24h",
  });

  res.json({
    success: true,
    data: {
      token,
      user: testUser,
    },
    message: "Token de test généré (développement uniquement)",
  });
});

// Route de connexion temporaire pour les tests
app.post("/api/auth/login-test", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Connexion de test simple (à remplacer par une vraie authentification)
    if (email === "admin@test.com" && password === "admin123") {
      const jwt = (await import("jsonwebtoken")).default;
      const testUser = {
        id: "507f1f77bcf86cd799439011",
        email: "admin@test.com",
        role: "admin",
        username: "admin",
      };

      const token = jwt.sign(
        testUser,
        process.env.JWT_SECRET || "test-secret",
        { expiresIn: "24h" }
      );

      // Définir le cookie
      res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 heures
      });

      res.json({
        success: true,
        data: {
          token,
          user: testUser,
        },
        message: "Connexion réussie",
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la connexion",
    });
  }
});

// Route de déconnexion
app.post("/api/auth/logout", (req: Request, res: Response) => {
  res.clearCookie("access_token");
  res.json({
    success: true,
    message: "Déconnexion réussie",
  });
});

// Route d'upload d'images
app.post(
  "/api/upload/image",
  upload.single("image"),
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Aucune image fournie",
        });
      }

      // Construire l'URL de l'image
      const imageUrl = `/uploads/images/${req.file.filename}`;

      res.json({
        success: true,
        data: {
          id: req.file.filename,
          url: imageUrl,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
        message: "Image uploadée avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'upload de l'image",
      });
    }
  }
);

// Route pour vérifier le statut de connexion
app.get("/api/auth/me", async (req: Request, res: Response) => {
  try {
    const { verifyToken } = await import("./middleware/auth.middleware.js");

    // Vérifier l'authentification
    await new Promise<void>((resolve, reject) => {
      verifyToken(req as any, res, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      success: true,
      data: {
        user: (req as any).user,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Non authentifié",
    });
  }
});

// Route de test pour l'authentification
app.get("/api/admin/auth-test", async (req: Request, res: Response) => {
  try {
    const { verifyToken, requireAdmin } = await import(
      "./middleware/auth.middleware.js"
    );

    // Vérifier l'authentification
    await new Promise<void>((resolve, reject) => {
      verifyToken(req as any, res, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise<void>((resolve, reject) => {
      requireAdmin(req as any, res, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      success: true,
      message: "Authentification réussie",
      user: (req as any).user,
    });
  } catch (error) {
    console.error("Erreur d'authentification:", error);
    if (!res.headersSent) {
      res.status(401).json({
        success: false,
        message: "Authentification échouée",
      });
    }
  }
});

// Routes du blog chargées directement ci-dessus

// Route 404 (doit être en dernier)
app.use("/*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route non trouvée",
    path: req.originalUrl,
  });
});

// Gestionnaire d'erreurs global
app.use(
  (
    err: AppError | Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    const statusCode = (err as AppError).statusCode || 500;
    const message = err.message || "Quelque chose a mal tourné !";

    // Logger l'erreur en développement
    if (serverConfig.nodeEnv === "development") {
      console.error("Erreur:", err);
    }

    res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      ...(serverConfig.nodeEnv === "development" && { stack: err.stack }),
    });
  }
);

// Fonction pour démarrer le serveur
const startServer = async (): Promise<void> => {
  try {
    // Démarrer le serveur d'abord
    app.listen(serverConfig.port, () => {
      console.log(`🚀 Serveur démarré sur le port ${serverConfig.port}`);
      console.log(`🌍 Mode: ${serverConfig.nodeEnv}`);
      console.log("🔒 Sécurité JWT, CORS et cookies activée");
      console.log(
        `📊 Health check: http://localhost:${serverConfig.port}/health`
      );
    });

    // Essayer de se connecter à MongoDB (optionnel en développement)
    try {
      await mongoose.connect(databaseConfig.uri);
      console.log("✅ Connecté à MongoDB avec succès");

      // Démarrer le planificateur de nettoyage seulement si MongoDB est connecté
      startCleanupScheduler();
    } catch (dbError) {
      console.warn(
        "⚠️  Impossible de se connecter à MongoDB:",
        (dbError as Error).message
      );
      console.log(
        "💡 Le serveur fonctionne sans base de données (mode développement)"
      );
    }
  } catch (error) {
    console.error("❌ Erreur de démarrage du serveur :", error);
    process.exit(1);
  }
};

// Gestion des signaux d'arrêt
process.on("SIGINT", () => {
  console.log("\n🛑 Arrêt du serveur...");
  mongoose.connection.close().then(() => {
    console.log("✅ Connexion MongoDB fermée");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Arrêt du serveur...");
  mongoose.connection.close().then(() => {
    console.log("✅ Connexion MongoDB fermée");
    process.exit(0);
  });
});

// Démarrer le serveur
startServer();
