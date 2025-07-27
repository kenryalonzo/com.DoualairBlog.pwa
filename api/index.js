import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.route.js";
import authRoute from "./routes/auth.route.js";
import {
  helmetConfig,
  generalLimiter,
  sanitizeInput,
  validateContentType,
} from "./middleware/security.middleware.js";
import { startCleanupScheduler } from "./utils/cleanup.utils.js";

// Charger les variables d'environnement
dotenv.config();

// Vérifier les variables d'environnement requises
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Erreur : ${envVar} non défini dans le fichier .env`);
    process.exit(1);
  }
}

// Initialiser l'application Express
const app = express();

// Configuration CORS
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [process.env.FRONTEND_URL || "http://localhost:5173"]
      : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true, // Permettre les cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"],
};

app.use(cors(corsOptions));

// Middleware de sécurité
app.use(helmetConfig);
app.use(generalLimiter);

// Middleware pour parser les cookies et JSON
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware de validation et nettoyage
app.use(validateContentType);
app.use(sanitizeInput);

// Routes
app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);

// Se connecter à MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connecté à MongoDB avec succès");

    // Démarrer le planificateur de nettoyage
    startCleanupScheduler();

    // Démarrer le serveur uniquement si la connexion à MongoDB réussit
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Serveur démarré sur le port ${port}`);
      console.log(`Mode: ${process.env.NODE_ENV || "development"}`);
      console.log("🔒 Sécurité JWT, CORS et cookies activée");
    });
  })
  .catch((error) => {
    console.error("Erreur de connexion à MongoDB :", error.message);
    process.exit(1);
  });

// Gestion des erreurs
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Quelque chose a mal tourné !";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
