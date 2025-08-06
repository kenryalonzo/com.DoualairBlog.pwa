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
  console.log("[DeleteConfirmModal] isOpen:", isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[1000]"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="modal-box max-w-md bg-base-100 shadow-2xl border border-base-300 relative"
            onClick={(e) => e.stopPropagation()}
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

            <div className="modal-action flex justify-end mt-6">
              <button onClick={onClose} className="btn btn-ghost mr-2">
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
