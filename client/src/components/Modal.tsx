import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
}: ModalProps) => {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className={`w-full ${sizeClasses[size]}`}>
              <motion.div className="card bg-base-100 shadow-2xl" layout>
                {/* Header */}
                {(title || showCloseButton) && (
                  <div className="card-body pb-0">
                    <div className="flex items-center justify-between">
                      {title && <h2 className="card-title text-lg">{title}</h2>}
                      {showCloseButton && (
                        <motion.button
                          className="btn btn-ghost btn-sm btn-circle"
                          onClick={onClose}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FaTimes className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="card-body pt-0">{children}</div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Composant Modal avec boutons d'action
interface ModalWithActionsProps extends ModalProps {
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "secondary" | "accent" | "error";
  loading?: boolean;
}

export const ModalWithActions = ({
  onConfirm,
  onCancel,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  confirmVariant = "primary",
  loading = false,
  onClose,
  ...modalProps
}: ModalWithActionsProps) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  return (
    <Modal {...modalProps} onClose={onClose}>
      <div className="space-y-4">
        {modalProps.children}

        <div className="flex justify-end space-x-3 pt-4">
          <motion.button
            className="btn btn-outline"
            onClick={handleCancel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {cancelText}
          </motion.button>

          <motion.button
            className={`btn btn-${confirmVariant}`}
            onClick={handleConfirm}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              confirmText
            )}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;
