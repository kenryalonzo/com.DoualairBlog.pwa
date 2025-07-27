import User from "../models/user.model.js";

// Nettoyer les tokens de rafraîchissement expirés
export const cleanupExpiredTokens = async () => {
  try {
    const now = new Date();

    // Trouver tous les utilisateurs avec des tokens expirés
    const users = await User.find({
      "refreshTokens.expiresAt": { $lt: now },
    });

    for (const user of users) {
      // Supprimer les tokens expirés
      user.refreshTokens = user.refreshTokens.filter(
        (token) => token.expiresAt > now
      );
      await user.save();
    }

    console.log(`Nettoyage terminé pour ${users.length} utilisateurs`);
  } catch (error) {
    console.error("Erreur lors du nettoyage des tokens:", error);
  }
};

// Fonction pour exécuter le nettoyage périodiquement
export const startCleanupScheduler = () => {
  // Nettoyer toutes les heures
  setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

  // Nettoyer au démarrage
  cleanupExpiredTokens();

  console.log("Planificateur de nettoyage des tokens démarré");
};
