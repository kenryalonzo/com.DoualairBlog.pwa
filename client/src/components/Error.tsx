import { motion } from "framer-motion";
import { FaExclamationTriangle, FaHome, FaRefresh } from "react-icons/fa";
import { Link } from "react-router-dom";

interface ErrorProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  showRetryButton?: boolean;
  onRetry?: () => void;
}

const Error = ({
  title = "Une erreur est survenue",
  message = "Désolé, quelque chose s'est mal passé. Veuillez réessayer.",
  showHomeButton = true,
  showRetryButton = true,
  onRetry,
}: ErrorProps) => {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <motion.div
        className="card bg-base-100 shadow-xl max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="card-body text-center">
          <motion.div
            className="mb-6"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              scale: { duration: 2, repeat: Infinity },
              rotate: { duration: 3, repeat: Infinity },
            }}
          >
            <div className="avatar placeholder">
              <div className="bg-error text-error-content rounded-full w-20">
                <FaExclamationTriangle className="text-3xl" />
              </div>
            </div>
          </motion.div>

          <h2 className="card-title text-2xl justify-center mb-4">{title}</h2>

          <p className="opacity-70 mb-6">{message}</p>

          <div className="card-actions justify-center space-x-4">
            {showRetryButton && onRetry && (
              <motion.button
                className="btn btn-primary"
                onClick={onRetry}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaRefresh className="mr-2" />
                Réessayer
              </motion.button>
            )}

            {showHomeButton && (
              <Link to="/">
                <motion.button
                  className="btn btn-outline"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaHome className="mr-2" />
                  Accueil
                </motion.button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Error;
