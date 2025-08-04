import { motion } from "framer-motion";
import { Lock, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export const AccessDenied = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-base-200"
    >
      <div className="text-center max-w-md mx-auto p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mb-6"
        >
          <Shield className="w-8 h-8 text-error" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-base-content mb-4"
        >
          Accès refusé
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-base-content/70 mb-8"
        >
          Vous devez être connecté pour accéder à cette page. Veuillez vous
          connecter pour continuer.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <Link to="/sign-in" className="btn btn-primary w-full">
            <Lock className="w-4 h-4 mr-2" />
            Se connecter
          </Link>

          <Link to="/" className="btn btn-outline w-full">
            Retour à l'accueil
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};
