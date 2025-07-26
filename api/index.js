import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoute from "./routes/user.route.js";
import authRoute from "./routes/auth.route.js";

// Charger les variables d'environnement
dotenv.config();

// Vérifier que MONGO_URI est défini
if (!process.env.MONGO_URI) {
  console.error('Erreur : MONGO_URI non défini dans le fichier .env');
  process.exit(1);
}

// Initialiser l'application Express
const app = express();

// Se connecter à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connecté à MongoDB avec succès');
    
    // Démarrer le serveur uniquement si la connexion à MongoDB réussit
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Serveur démarré sur le port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Erreur de connexion à MongoDB :', error.message);
    process.exit(1);
  });

// Middleware pour parser le JSON
app.use(express.json());

app.use('/api/user', userRoute);
app.use('/api/auth', authRoute);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Quelque chose a mal tourné !' });
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Quelque chose a mal tourné !';
    res.status(statusCode).json({ 
        success: false,
        statusCode,
        message
    });
});