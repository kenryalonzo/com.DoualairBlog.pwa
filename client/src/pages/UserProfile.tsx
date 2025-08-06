import {
  ArrowLeftIcon,
  EnvelopeIcon,
  KeyIcon,
  TrashIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToastContext } from "../contexts/ToastContext";
import { useAuth } from "../hooks/useAuth";

const UserProfilePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToastContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Rediriger si non authentifié
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/sign-in");
      return;
    }

    // Remplir le formulaire avec les données utilisateur
    setFormData({
      username: user.username || "",
      email: user.email || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
    });
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // TODO: Implémenter la mise à jour du profil via API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulation
      toast.success("Profil mis à jour avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // TODO: Implémenter la suppression du compte via API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulation
      toast.success("Compte supprimé avec succès");
      logout();
      navigate("/");
    } catch (error) {
      toast.error("Erreur lors de la suppression du compte");
    }
    setShowDeleteConfirm(false);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-base-100 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="btn btn-ghost btn-sm"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </button>
              <div>
                <h1 className="text-2xl font-bold">Mon Profil</h1>
                <p className="text-base-content/60">
                  Gérez vos informations personnelles
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="avatar">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {user.firstName && user.lastName
                        ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                        : user.username.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="font-medium">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.username}
                </p>
                <p className="text-sm text-base-content/60">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Informations personnelles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-base-100 shadow-sm mb-6"
          >
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">
                <UserIcon className="w-5 h-5" />
                Informations personnelles
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Prénom</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Votre prénom"
                    className="input input-bordered"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nom</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Votre nom"
                    className="input input-bordered"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nom d'utilisateur</span>
                </label>
                <input
                  type="text"
                  placeholder="Votre nom d'utilisateur"
                  className="input input-bordered"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="Votre email"
                  className="input input-bordered"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div className="card-actions justify-end mt-6">
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Sauvegarder"
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Sécurité */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-base-100 shadow-sm mb-6"
          >
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">
                <KeyIcon className="w-5 h-5" />
                Sécurité
              </h2>

              <div className="alert alert-info">
                <EnvelopeIcon className="w-5 h-5" />
                <div>
                  <h3 className="font-bold">Authentification Firebase</h3>
                  <div className="text-sm">
                    Votre compte est sécurisé par Firebase. Pour modifier votre
                    mot de passe, utilisez les options de récupération de votre
                    fournisseur d'authentification.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Zone dangereuse */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card bg-base-100 shadow-sm border border-error/20"
          >
            <div className="card-body">
              <h2 className="card-title text-lg mb-4 text-error">
                <TrashIcon className="w-5 h-5" />
                Zone dangereuse
              </h2>

              <div className="alert alert-warning">
                <div>
                  <h3 className="font-bold">Supprimer le compte</h3>
                  <div className="text-sm">
                    Cette action est irréversible. Toutes vos données seront
                    définitivement supprimées.
                  </div>
                </div>
              </div>

              <div className="card-actions justify-end mt-4">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn btn-error btn-outline"
                >
                  Supprimer le compte
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">
              Confirmer la suppression
            </h3>
            <p className="py-4">
              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est
              irréversible et toutes vos données seront définitivement perdues.
            </p>
            <div className="modal-action">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-ghost"
              >
                Annuler
              </button>
              <button onClick={handleDeleteAccount} className="btn btn-error">
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
