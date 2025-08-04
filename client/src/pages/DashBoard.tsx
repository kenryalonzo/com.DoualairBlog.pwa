import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  KeyRound,
  LogOut,
  Palette,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import type { RootState } from "../redux/store";
import { signOutSuccess } from "../redux/user/userSlice";

// --- Types ---
type User = {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  photo?: string;
  profilePicture?: string | null;
};

type ProfileSettingsProps = {
  currentUser: User;
  onUpdateProfile: (data: {
    username?: string;
    email?: string;
    profilePicture?: string;
  }) => void;
};

type SecuritySettingsProps = {
  onShowDeleteConfirm: () => void;
  onDeleteAccount: () => void;
  onUpdatePassword: (newPassword: string, confirmPassword: string) => void;
};

// --- Section des composants de contenu ---

/**
 * Section pour modifier les informations du profil
 */
const ProfileSettings = ({
  currentUser,
  onUpdateProfile,
}: ProfileSettingsProps) => {
  const filePickerRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    profilePicture: currentUser?.profilePicture || undefined,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData((prev) => ({ ...prev, profilePicture: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!formData.username.trim() || !formData.email.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    try {
      await onUpdateProfile(formData);
      toast.success("Profil mis à jour avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
      console.error("Erreur lors de la mise à jour du profil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Carte pour la photo de profil */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">
            <Camera className="w-5 h-5" />
            Photo de profil
          </h3>
          <p className="text-base-content/70">
            Mettez à jour votre photo de profil.
          </p>

          <div className="flex items-center gap-6 mt-4">
            <div className="avatar">
              <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src={
                    formData.profilePicture ||
                    `https://placehold.co/80x80/E2E8F0/475569?text=${currentUser?.username
                      ?.charAt(0)
                      .toUpperCase()}`
                  }
                  alt="Photo de profil"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = `https://placehold.co/80x80/E2E8F0/475569?text=${currentUser?.username
                      ?.charAt(0)
                      .toUpperCase()}`;
                  }}
                />
              </div>
            </div>

            <input
              type="file"
              ref={filePickerRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
            <button
              onClick={() => filePickerRef.current?.click()}
              className="btn btn-outline"
            >
              Changer la photo
            </button>
          </div>
        </div>
      </div>

      {/* Carte pour les informations personnelles */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">
            <User className="w-5 h-5" />
            Informations personnelles
          </h3>
          <p className="text-base-content/70">
            Modifiez votre nom d'utilisateur et votre adresse e-mail.
          </p>

          <div className="form-control w-full mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  <span className="label-text">Nom d'utilisateur</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Adresse e-mail</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            <div className="card-actions justify-end mt-6">
              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer les modifications"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Section pour la sécurité du compte
 */
const SecuritySettings = ({
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

// --- Composant principal du tableau de bord ---

const DashBoard = () => {
  // --- États ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // --- Hooks Redux et Router ---
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useSelector((state: RootState) => state.user);

  // Gérer le cas où currentUser peut être null
  const user = currentUser || {
    username: "Utilisateur",
    email: "user@example.com",
    profilePicture: null,
  };

  console.log("[Dashboard] Current user:", currentUser);
  console.log("[Dashboard] User object:", user);

  // --- Gestion du routage ---
  const currentSection = searchParams.get("section") || "profile";

  // Déterminer l'onglet actif basé sur l'URL
  const getActiveTab = () => {
    if (currentSection === "security") {
      return "security";
    }
    return "profile";
  };

  const activeTab = getActiveTab();

  // Fonction pour naviguer vers une section
  const navigateToSection = (section: string, action?: string) => {
    const params = new URLSearchParams();
    params.set("section", section);
    if (action) {
      params.set("action", action);
    }
    setSearchParams(params);
  };

  // --- Gestionnaires d'événements ---
  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        dispatch(signOutSuccess());
        toast.success("Déconnexion réussie !", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        // Délai pour permettre au toast de s'afficher
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        toast.error("Erreur lors de la déconnexion", {
          position: "top-right",
          autoClose: 3000,
        });
        console.error("Erreur lors de la déconnexion:", response.status);
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion", {
        position: "top-right",
        autoClose: 3000,
      });
      // Même en cas d'erreur, on déconnecte localement
      dispatch(signOutSuccess());
      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de la suppression du compte"
        );
      }

      console.log("Compte supprimé avec succès");
      setShowDeleteConfirm(false);
      toast.success("Compte supprimé avec succès");
      dispatch(signOutSuccess());
      navigate("/");
    } catch (error) {
      toast.error("Erreur lors de la suppression du compte");
      console.error("Erreur lors de la suppression du compte:", error);
    }
  };

  const handleUpdateProfile = async (data: {
    username?: string;
    email?: string;
    profilePicture?: string;
  }) => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de la mise à jour du profil"
        );
      }

      const result = await response.json();
      console.log("Profil mis à jour:", result);

      // Mettre à jour le state Redux si nécessaire
      // dispatch(updateUserProfile(result));
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      throw error;
    }
  };

  const handleUpdatePassword = async (
    newPassword: string,
    confirmPassword: string
  ) => {
    // Validation côté frontend
    if (newPassword !== confirmPassword) {
      throw new Error("Les mots de passe ne correspondent pas");
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: "", // L'utilisateur devra fournir l'ancien mot de passe
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors du changement de mot de passe"
        );
      }

      const result = await response.json();
      console.log("Mot de passe mis à jour avec succès:", result);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error);
      throw error;
    }
  };

  // Fermer la sidebar en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- Éléments de menu ---
  const menuItems = [
    {
      id: "profile",
      name: "Modifier mon compte",
      icon: User,
      url: "profile",
    },
    {
      id: "security",
      name: "Sécurité",
      icon: ShieldCheck,
      url: "security",
    },
  ];

  // --- Rendu du contenu dynamique ---
  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfileSettings
            currentUser={user}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      case "security":
        return (
          <SecuritySettings
            onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
            onDeleteAccount={handleDeleteAccount}
            onUpdatePassword={handleUpdatePassword}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      {/* Layout principal */}
      <div className="flex">
        {/* Sidebar (Desktop) */}
        <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
          <div className="fixed left-0 top-0 h-full w-64 bg-base-100 shadow-xl border-r border-base-300 flex flex-col z-50">
            {/* Logo */}
            <div className="navbar bg-base-100 border-b border-base-300">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Palette className="w-6 h-6 text-primary" />
                  <h1 className="text-xl font-bold">Mon Dashboard</h1>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 p-4">
              <ul className="menu menu-lg bg-base-100 w-full">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => navigateToSection(item.url)}
                      className={`${activeTab === item.id ? "active" : ""}`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section Déconnexion */}
            <div className="p-4 border-t border-base-300">
              <button
                onClick={handleSignOut}
                className="btn btn-outline w-full"
              >
                <LogOut className="w-5 h-5" />
                Se déconnecter
              </button>
            </div>
          </div>
        </div>

        {/* Header Mobile */}
        <div className="lg:hidden navbar bg-base-100 shadow-lg sticky top-0 z-40">
          <div className="navbar-start">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="btn btn-ghost btn-square"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>
          <div className="navbar-center">
            <h1 className="text-lg font-semibold">
              {menuItems.find((item) => item.id === activeTab)?.name}
            </h1>
          </div>
          <div className="navbar-end">
            <div className="w-8"></div>
          </div>
        </div>

        {/* Sidebar (Mobile) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
              <motion.div
                ref={sidebarRef}
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed left-0 top-0 h-full w-64 bg-base-100 shadow-xl z-50 lg:hidden flex flex-col"
              >
                <div className="navbar bg-base-100 border-b border-base-300">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Palette className="w-6 h-6 text-primary" />
                      <h1 className="text-xl font-bold">Dashboard</h1>
                    </div>
                  </div>
                  <div className="flex-none">
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="btn btn-ghost btn-square"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-4">
                  <ul className="menu menu-lg bg-base-100 w-full">
                    {menuItems.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => {
                            navigateToSection(item.url);
                            setIsSidebarOpen(false);
                          }}
                          className={`${activeTab === item.id ? "active" : ""}`}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 border-t border-base-300">
                  <button
                    onClick={handleSignOut}
                    className="btn btn-outline w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    Se déconnecter
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Contenu Principal */}
        <main className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-10">
            <div className="max-w-6xl mx-auto lg:mr-0 lg:ml-auto lg:pr-8">
              {/* Header du contenu */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold">
                  {menuItems.find((item) => item.id === activeTab)?.name}
                </h2>
                <p className="text-base-content/70 mt-2">
                  Gérez les paramètres de votre compte ici.
                </p>
              </div>

              {/* Contenu dynamique */}
              <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de confirmation de suppression */}
      <AnimatePresence>
        {showDeleteConfirm && (
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
              className="modal-box max-w-md"
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
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-ghost"
                >
                  Annuler
                </button>
                <button onClick={handleDeleteAccount} className="btn btn-error">
                  Oui, supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashBoard;
