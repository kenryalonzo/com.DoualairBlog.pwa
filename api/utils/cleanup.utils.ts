import User from "../models/user.model.js";

// Nettoyer les tokens de rafraîchissement expirés
export const cleanupExpiredTokens = async (): Promise<void> => {
  try {
    const now = new Date();

    // Trouver tous les utilisateurs avec des tokens expirés
    const users = await User.find({
      "refreshTokens.expiresAt": { $lt: now },
    });

    let cleanedCount = 0;
    for (const user of users) {
      const initialTokenCount = user.refreshTokens.length;

      // Nettoyer les tokens expirés manuellement
      const now = new Date();
      user.refreshTokens = user.refreshTokens.filter(
        (token) => token.expiresAt > now
      );

      if (user.refreshTokens.length < initialTokenCount) {
        await user.save();
        cleanedCount += initialTokenCount - user.refreshTokens.length;
      }
    }

    console.log(
      `Nettoyage terminé : ${cleanedCount} tokens expirés supprimés de ${users.length} utilisateurs`
    );
  } catch (error) {
    console.error("Erreur lors du nettoyage des tokens:", error);
  }
};

// Interface pour la configuration du planificateur
interface CleanupSchedulerConfig {
  interval: number; // en millisecondes
  runOnStart?: boolean;
}

// Fonction pour exécuter le nettoyage périodiquement
export const startCleanupScheduler = (
  config: CleanupSchedulerConfig = { interval: 60 * 60 * 1000 }
): void => {
  const { interval, runOnStart = true } = config;

  // Nettoyer périodiquement
  setInterval(cleanupExpiredTokens, interval);

  // Nettoyer au démarrage si configuré
  if (runOnStart) {
    cleanupExpiredTokens();
  }

  console.log(
    `Planificateur de nettoyage démarré (intervalle: ${
      interval / (1000 * 60)
    } minutes)`
  );
};

// Fonction pour nettoyer les tokens d'un utilisateur spécifique
export const cleanupUserTokens = async (userId: string): Promise<boolean> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return false;
    }

    const initialTokenCount = user.refreshTokens.length;
    const now = new Date();
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token.expiresAt > now
    );

    if (user.refreshTokens.length < initialTokenCount) {
      await user.save();
      console.log(
        `Nettoyage utilisateur ${userId}: ${
          initialTokenCount - user.refreshTokens.length
        } tokens supprimés`
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error(
      `Erreur lors du nettoyage des tokens pour l'utilisateur ${userId}:`,
      error
    );
    return false;
  }
};

// Fonction pour obtenir les statistiques de nettoyage
export const getCleanupStats = async (): Promise<{
  totalUsers: number;
  usersWithExpiredTokens: number;
  totalExpiredTokens: number;
}> => {
  try {
    const now = new Date();

    const totalUsers = await User.countDocuments();
    const usersWithExpiredTokens = await User.countDocuments({
      "refreshTokens.expiresAt": { $lt: now },
    });

    const users = await User.find({
      "refreshTokens.expiresAt": { $lt: now },
    });

    const totalExpiredTokens = users.reduce((count, user) => {
      return (
        count +
        user.refreshTokens.filter((token) => token.expiresAt < now).length
      );
    }, 0);

    return {
      totalUsers,
      usersWithExpiredTokens,
      totalExpiredTokens,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return {
      totalUsers: 0,
      usersWithExpiredTokens: 0,
      totalExpiredTokens: 0,
    };
  }
};
