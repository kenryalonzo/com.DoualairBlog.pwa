import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

const Toast = ({ toast, onRemove }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "error":
        return <XCircle className="w-5 h-5 text-error" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-warning" />;
      case "info":
      default:
        return <Info className="w-5 h-5 text-info" />;
    }
  };

  const getAlertClass = () => {
    switch (toast.type) {
      case "success":
        return "alert-success";
      case "error":
        return "alert-error";
      case "warning":
        return "alert-warning";
      case "info":
      default:
        return "alert-info";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`alert ${getAlertClass()} shadow-lg mb-2 cursor-pointer`}
      onClick={() => onRemove(toast.id)}
      style={{
        // Styles forcés pour debug
        position: "relative",
        zIndex: 999999,
        backgroundColor: "#10b981",
        color: "white",
        border: "2px solid #059669",
        minHeight: "60px",
        display: "flex",
        alignItems: "center",
      }}
    >
      {getIcon()}
      <span>{toast.message}</span>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  console.log(
    "[ToastContainer] Rendering with",
    toasts.length,
    "toasts:",
    toasts
  );

  return (
    <div
      className="fixed top-4 right-4 max-w-sm w-full pointer-events-none"
      style={{
        zIndex: 999999,
        position: "fixed",
        top: "1rem",
        right: "1rem",
        border: "2px solid red", // Debug: bordure rouge temporaire
        minHeight: "50px", // Debug: hauteur minimale pour voir le container
        backgroundColor: "rgba(255,0,0,0.1)", // Debug: fond rouge transparent
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onRemove={onRemove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook pour gérer les toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastType, message: string, duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { id, type, message, duration };

    setToasts((prev) => [...prev, newToast]);

    // Log pour debug
    console.log(`[Toast] ${type.toUpperCase()}: ${message}`);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const toast = {
    success: (message: string, duration?: number) =>
      addToast("success", message, duration),
    error: (message: string, duration?: number) =>
      addToast("error", message, duration),
    info: (message: string, duration?: number) =>
      addToast("info", message, duration),
    warning: (message: string, duration?: number) =>
      addToast("warning", message, duration),
  };

  return { toasts, removeToast, toast };
};
