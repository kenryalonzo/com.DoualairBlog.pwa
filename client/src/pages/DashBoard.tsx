import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  DashboardHeader,
  DashboardSidebar,
  DeleteConfirmModal,
  MobileSidebar,
  ProfileSettings,
  SecuritySettings,
  UserDataDebug,
} from "../components/dashboard";
import type { ProfileUpdateData, User } from "../components/dashboard/types";
import type { RootState } from "../redux/store";
import { signOutSuccess } from "../redux/user/userSlice";

const DashBoard = () => {
  // --- États ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // --- Hooks Redux et Router ---
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useSelector((state: RootState) => state.user);

  // Gérer le cas où currentUser peut être null
  const user: User = currentUser || {
    username: "Utilisateur",
    email: "user@example.com",
    profilePicture: null,
  };

  // --- Gestion du routage ---
  const currentSection = searchParams.get("section") || "profile";

  // Déterminer l'onglet actif basé sur l'URL
  const getActiveTab = () => {
    if (currentSection === "security") return "security";
    return "profile";
  };

  const activeTab = getActiveTab();

  // Fonction pour naviguer vers une section
  const navigateToSection = (section: string) => {
    const params = new URLSearchParams();
    params.set("section", section);
    setSearchParams(params);
  };

  // --- Gestionnaires d'événements ---
  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        setTimeout(() => navigate("/"), 1000);
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
      dispatch(signOutSuccess());
      setTimeout(() => navigate("/"), 1000);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
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

  const handleUpdateProfile = async (data: ProfileUpdateData) => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      throw error;
    }
  };

  const handleUpdatePassword = async (
    newPassword: string,
    confirmPassword: string
  ) => {
    if (newPassword !== confirmPassword)
      throw new Error("Les mots de passe ne correspondent pas");

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newPassword }),
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

  // --- Éléments de menu ---
  const menuItems = [
    { id: "profile", name: "Profil", url: "profile" },
    { id: "security", name: "Sécurité", url: "security" },
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
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar (Desktop) */}
        <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
          <DashboardSidebar
            currentUser={user}
            activeTab={activeTab}
            onNavigateToSection={navigateToSection}
            onSignOut={handleSignOut}
          />
        </div>

        {/* Header Mobile */}
        <DashboardHeader
          activeTab={activeTab}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        {/* Sidebar (Mobile) */}
        <MobileSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentUser={user}
          activeTab={activeTab}
          onNavigateToSection={navigateToSection}
          onSignOut={handleSignOut}
        />

        {/* Contenu Principal */}
        <main className="flex-1 lg:ml-48 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header du contenu */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold">
                {menuItems.find((item) => item.id === activeTab)?.name}
              </h2>
              <p className="text-base-content/70 mt-2">
                Gérez les paramètres de votre compte ici.
              </p>
            </div>

            {/* Debug - Données utilisateur (développement uniquement) */}
            <UserDataDebug user={user} />

            {/* Contenu dynamique */}
            <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
          </div>
        </main>
      </div>

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
};

export default DashBoard;
