import { motion } from "framer-motion";
import { FaPlane } from "react-icons/fa";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

const Loading = ({
  size = "md",
  text = "Chargement...",
  fullScreen = false,
}: LoadingProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const containerClasses = fullScreen
    ? "min-h-screen flex items-center justify-center bg-base-200"
    : "flex items-center justify-center p-4";

  return (
    <div className={containerClasses}>
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className={`${sizeClasses[size]} mx-auto mb-4`}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <div className="loading loading-spinner loading-lg text-primary">
            <FaPlane className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.p
          className="text-base-content/70 font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Loading;
