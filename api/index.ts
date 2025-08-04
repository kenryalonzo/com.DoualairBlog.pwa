import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Application, NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
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

// Routes
app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);

// Route de santé
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Serveur opérationnel",
    timestamp: new Date().toISOString(),
    environment: serverConfig.nodeEnv,
  });
});

// Route 404
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
