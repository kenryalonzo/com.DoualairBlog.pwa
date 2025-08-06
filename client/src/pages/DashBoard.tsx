import { AnimatePresence } from "framer-motion";
import { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  DashboardHeader,
  DashboardSidebar,
  DeleteConfirmModal,
  MobileSidebar,
  ProfileSettings,
  SecuritySettings,
} from "../components/dashboard";
import type { ProfileUpdateData } from "../components/dashboard/types";
import { useToastContext } from "../contexts/ToastContext";
import { useAuth } from "../hooks/useAuth";
import {
  updateUserFailure,
  updateUserStart,
  updateUserSuccess,
} from "../redux/user/userSlice";
import { authService, userService } from "../services/api";

const DashBoard = () => {
  // --- États ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Debug pour la modale
  console.log("[Dashboard] showDeleteConfirm:", showDeleteConfirm);

  // --- Hooks Redux et Router ---
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated, authType, logout } = useAuth();
  const { toast } = useToastContext();

  // Vérifier l'authentification avec useEffect
  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.log("[Dashboard] User not authenticated, redirecting to sign-in");
      navigate("/sign-in");
    }
  }, [isAuthenticated, user, navigate]);

  // Afficher un loader si pas encore authentifié
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  console.log("[Dashboard] User authenticated via:", authType);
  console.log("[Dashboard] User role:", user.role);

  // --- Gestion du routage ---
  const currentSection = searchParams.get("section") || "profile";

  // Déterminer l'onglet actif basé sur l'URL
  const getActiveTab = () => {
    const validSections = [
      "profile",
      "security",
      "articles",
      "categories",
      "tags",
      "analytics",
    ];
    if (currentSection && validSections.includes(currentSection)) {
      return currentSection;
    }
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
      // Afficher le toast immédiatement
      toast.success("Déconnexion en cours...", 2000);

      // Déconnexion Firebase si nécessaire
      if (authType === "firebase") {
        await authService.signOut();
      }

      // Déconnexion unifiée (nettoie JWT + Redux)
      logout();

      toast.success("Déconnexion réussie !");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");

      // Déconnecter quand même l'utilisateur côté client
      logout();
      setTimeout(() => navigate("/"), 1500);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await userService.deleteAccount();
      console.log("Compte supprimé avec succès");
      setShowDeleteConfirm(false);
      toast.success("Compte supprimé avec succès");
      logout();
      navigate("/");
    } catch (error) {
      toast.error("Erreur lors de la suppression du compte");
      console.error("Erreur lors de la suppression du compte:", error);
    }
  };

  const handleUpdateProfile = async (data: ProfileUpdateData) => {
    dispatch(updateUserStart());

    // Toast immédiat pour indiquer le début de l'opération
    toast.info("Mise à jour du profil en cours...", 2000);

    try {
      const response = await userService.updateProfile(data);

      // Mettre à jour l'état Redux avec les nouvelles données utilisateur
      if (response.data && response.data.user) {
        dispatch(updateUserSuccess(response.data.user));

        // Toast de succès immédiat
        toast.success("✅ Profil mis à jour avec succès !", 3000);
      } else {
        throw new Error("Réponse invalide du serveur");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour du profil";
      console.error("Erreur lors de la mise à jour du profil:", error);
      dispatch(updateUserFailure(errorMessage));

      // Toast d'erreur immédiat
      toast.error(`❌ ${errorMessage}`, 5000);
      throw error;
    }
  };

  const handleUpdatePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    if (newPassword !== confirmPassword) {
      toast.error("❌ Les mots de passe ne correspondent pas");
      throw new Error("Les mots de passe ne correspondent pas");
    }

    // Toast immédiat
    toast.info("🔄 Changement de mot de passe en cours...", 2000);

    try {
      await userService.updatePassword({ currentPassword, newPassword });

      // Toast de succès immédiat
      toast.success("✅ Mot de passe mis à jour avec succès !", 3000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors du changement de mot de passe";
      console.error("Erreur lors de la mise à jour du mot de passe:", error);

      // Toast d'erreur immédiat
      toast.error(`❌ ${errorMessage}`, 5000);
      throw error;
    }
  };

  // --- Éléments de menu ---
  const menuItems = [
    { id: "profile", name: "Profil", url: "profile", icon: "👤" },
    { id: "security", name: "Sécurité", url: "security", icon: "🔒" },
    ...(user.role === "admin"
      ? [
          {
            id: "articles",
            name: "Articles",
            url: "articles",
            icon: "📝",
            admin: true,
          },
          {
            id: "categories",
            name: "Catégories",
            url: "categories",
            icon: "🏷️",
            admin: true,
          },
          { id: "tags", name: "Tags", url: "tags", icon: "🔖", admin: true },
          {
            id: "analytics",
            name: "Statistiques",
            url: "analytics",
            icon: "📊",
            admin: true,
          },
        ]
      : []),
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
      case "articles": {
        const ArticleManagement = lazy(
          () => import("../components/admin/ArticleManagement")
        );
        return (
          <Suspense
            fallback={
              <div className="flex justify-center items-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            }
          >
            <ArticleManagement />
          </Suspense>
        );
      }
      case "categories": {
        const CategoryManagement = lazy(
          () => import("../components/admin/CategoryManagement")
        );
        return (
          <Suspense
            fallback={
              <div className="flex justify-center items-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            }
          >
            <CategoryManagement />
          </Suspense>
        );
      }
      case "tags": {
        const TagManagement = lazy(
          () => import("../components/admin/TagManagement")
        );
        return (
          <Suspense
            fallback={
              <div className="flex justify-center items-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            }
          >
            <TagManagement />
          </Suspense>
        );
      }
      case "analytics": {
        const StatsOverview = lazy(
          () => import("../components/admin/StatsOverview")
        );
        return (
          <Suspense
            fallback={
              <div className="flex justify-center items-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            }
          >
            <StatsOverview />
          </Suspense>
        );
      }
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
            menuItems={menuItems}
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
          menuItems={menuItems}
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
