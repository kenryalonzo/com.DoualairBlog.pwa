import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";

type DeleteConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="modal-box max-w-md bg-base-100"
          >
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-error/20 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-error" />
              </div>
              <h3 className="text-lg font-semibold">Supprimer le compte</h3>
              <p className="text-base-content/70 mt-2">
                Êtes-vous sûr de vouloir supprimer votre compte ? Cette action
                est définitive et irréversible.
              </p>
            </div>

            <div className="modal-action">
              <button onClick={onClose} className="btn btn-ghost">
                Annuler
              </button>
              <button onClick={onConfirm} className="btn btn-error">
                Oui, supprimer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
