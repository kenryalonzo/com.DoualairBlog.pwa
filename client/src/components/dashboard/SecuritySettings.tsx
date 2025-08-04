import { motion } from "framer-motion";
import { KeyRound, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

type SecuritySettingsProps = {
  onShowDeleteConfirm: () => void;
  onUpdatePassword: (newPassword: string, confirmPassword: string) => void;
};

export const SecuritySettings = ({
  onShowDeleteConfirm,
  onUpdatePassword,
}: SecuritySettingsProps) => {
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsLoading(true);
    try {
      await onUpdatePassword(
        passwordData.newPassword,
        passwordData.confirmPassword
      );
      setPasswordData({ newPassword: "", confirmPassword: "" });
      toast.success("Mot de passe mis à jour avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du mot de passe");
      console.error("Erreur lors de la mise à jour du mot de passe:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key="security"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Carte pour le mot de passe */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">
            <KeyRound className="w-5 h-5" />
            Mot de passe
          </h3>
          <p className="text-base-content/70">
            Changez votre mot de passe régulièrement pour sécuriser votre
            compte.
          </p>

          <div className="form-control w-full mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text">Nouveau mot de passe</span>
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    handlePasswordChange("newPassword", e.target.value)
                  }
                  placeholder="••••••••"
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Confirmer le mot de passe</span>
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    handlePasswordChange("confirmPassword", e.target.value)
                  }
                  placeholder="••••••••"
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            <div className="card-actions justify-end mt-6">
              <button
                onClick={handleUpdatePassword}
                disabled={
                  isLoading ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword
                }
                className="btn btn-primary"
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Mise à jour...
                  </>
                ) : (
                  "Changer le mot de passe"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Zone de danger */}
      <div className="card bg-error/10 border-error/20 shadow-xl">
        <div className="card-body">
          <h3 className="card-title text-error">
            <Trash2 className="w-5 h-5" />
            Zone de danger
          </h3>
          <p className="text-error/80">
            La suppression de votre compte est une action irréversible. Toutes
            vos données, y compris vos articles et commentaires, seront
            définitivement effacées.
          </p>

          <div className="card-actions justify-end">
            <button onClick={onShowDeleteConfirm} className="btn btn-error">
              Supprimer mon compte
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
