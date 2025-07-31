import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  TrashIcon,
  PhotoIcon,
  LockClosedIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { signOutSuccess, updateUserSuccess } from "../redux/user/userSlice";
import { toast } from "react-toastify";
import { userService } from "../services/api";

interface User {
  _id: string;
  username: string;
  name?: string;
  email: string;
  photo?: string;
  role?: string;
  createdAt?: string;
}

interface RootState {
  user: {
    currentUser: User | null;
  };
}

const DashBoard = () => {
  const [activeSection, setActiveSection] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "",
    name: "",
    email: "",
    photo: null as File | null,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [deletePassword, setDeletePassword] = useState("");
  const { currentUser } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Initialiser les données du profil
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        username: currentUser.username || "",
        name: currentUser.name || "",
        email: currentUser.email || "",
        photo: null,
      });
    }
  }, [currentUser]);

  // Rediriger si pas connecté
  if (!currentUser) {
    navigate("/sign-in");
    return null;
  }

  // Fonction pour gérer le changement de photo
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileData({ ...profileData, photo: e.target.files[0] });
    }
  };

  // Fonction pour mettre à jour le profil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", profileData.username);
      formData.append("name", profileData.name);
      formData.append("email", profileData.email);
      if (profileData.photo) {
        formData.append("photo", profileData.photo);
      }

      const response = await userService.updateProfile(formData);
      dispatch(updateUserSuccess(response.user));
      toast.success("Profil mis à jour avec succès !", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour du profil",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour le mot de passe
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (
      passwordData.newPassword.length < 8 ||
      !/^(?=.*[A-Za-z])(?=.*\d)/.test(passwordData.newPassword)
    ) {
      toast.error(
        "Le mot de passe doit contenir au moins 8 caractères, dont une lettre et un chiffre",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
      return;
    }

    setLoading(true);

    try {
      await userService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Mot de passe mis à jour avec succès !", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour du mot de passe",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer le compte
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Veuillez entrer votre mot de passe", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      await userService.deleteAccount(deletePassword);
      dispatch(signOutSuccess());
      toast.success("Compte supprimé avec succès", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression du compte",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    } finally {
      setLoading(false);
      setDeletePassword("");
    }
  };

  // Fonction pour gérer la déconnexion
  const handleSignOut = async () => {
    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const res = await fetch(`${apiUrl}/auth/signout`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        dispatch(signOutSuccess());
        toast.success("Déconnexion réussie !", {
          position: "top-right",
          autoClose: 2000,
        });
        navigate("/");
      } else {
        toast.error("Erreur lors de la déconnexion", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error("Erreur lors de la déconnexion", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const formatName = (name: string | undefined | null) => {
    if (!name || typeof name !== "string") {
      return "Utilisateur";
    }
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const sidebarItems = [
    {
      id: "profile",
      name: "Modifier le profil",
      icon: UserIcon,
      description: "Nom, email et photo de profil",
    },
    {
      id: "security",
      name: "Sécurité",
      icon: LockClosedIcon,
      description: "Mot de passe et suppression du compte",
    },
    {
      id: "signout",
      name: "Se déconnecter",
      icon: ArrowRightOnRectangleIcon,
      description: "Quitter votre session",
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Modifier le profil
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gérez vos informations personnelles
              </p>
            </div>

            <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg rounded-xl shadow-sm border border-gray-200/20 dark:border-gray-700/20 p-6">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Photo de profil */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {profileData.photo ? (
                      <img
                        src={URL.createObjectURL(profileData.photo)}
                        alt="Profile Preview"
                        className="w-20 h-20 rounded-full object-cover border-4 border-blue-500"
                      />
                    ) : currentUser.photo ? (
                      <img
                        src={currentUser.photo}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-4 border-blue-500"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                        <UserIcon className="w-10 h-10 text-white" />
                      </div>
                    )}
                    <label className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors cursor-pointer">
                      <PhotoIcon className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Photo de profil
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Cliquez sur l'icône pour changer votre photo
                    </p>
                  </div>
                </div>

                {/* Informations personnelles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          name: e.target.value.trimStart(),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300/20 dark:border-gray-600/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/20 dark:bg-gray-700/20 text-gray-900 dark:text-white backdrop-blur-sm"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom d'utilisateur
                    </label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          username: e.target.value.trimStart(),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300/20 dark:border-gray-600/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/20 dark:bg-gray-700/20 text-gray-900 dark:text-white backdrop-blur-sm"
                      placeholder="Votre nom d'utilisateur"
                      minLength={3}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value.trimStart(),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300/20 dark:border-gray-600/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/20 dark:bg-gray-700/20 text-gray-900 dark:text-white backdrop-blur-sm"
                      placeholder="Votre email"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    disabled={
                      loading || !profileData.username || !profileData.email
                    }
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
                        <span>Sauvegarde...</span>
                      </>
                    ) : (
                      <span>Sauvegarder les modifications</span>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        );

      case "security":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Sécurité
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gérez votre mot de passe et paramètres de sécurité
              </p>
            </div>

            <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg rounded-xl shadow-sm border border-gray-200/20 dark:border-gray-700/20 p-6">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Changer le mot de passe
                  </h3>
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mot de passe actuel
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value.trimStart(),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300/20 dark:border-gray-600/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/20 dark:bg-gray-700/20 text-gray-900 dark:text-white backdrop-blur-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value.trimStart(),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300/20 dark:border-gray-600/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/20 dark:bg-gray-700/20 text-gray-900 dark:text-white backdrop-blur-sm"
                        required
                        minLength={8}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value.trimStart(),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300/20 dark:border-gray-600/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/20 dark:bg-gray-700/20 text-gray-900 dark:text-white backdrop-blur-sm"
                        required
                        minLength={8}
                      />
                    </div>
                    <div className="flex justify-end">
                      <motion.button
                        type="submit"
                        disabled={
                          loading ||
                          !passwordData.currentPassword ||
                          !passwordData.newPassword ||
                          !passwordData.confirmPassword
                        }
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
                            <span>Mise à jour...</span>
                          </>
                        ) : (
                          <span>Mettre à jour le mot de passe</span>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>

                <hr className="border-gray-200/20 dark:border-gray-700/20" />

                <div>
                  <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">
                    Supprimer le compte
                  </h3>
                  <div className="bg-red-50/10 dark:bg-red-900/10 border border-red-200/20 dark:border-red-800/20 rounded-lg p-4">
                    <div className="space-y-4">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Cette action est irréversible. Toutes vos données seront
                        supprimées.
                      </p>
                      <div className="flex items-center space-x-3">
                        <input
                          type="password"
                          placeholder="Entrez votre mot de passe"
                          value={deletePassword}
                          onChange={(e) =>
                            setDeletePassword(e.target.value.trimStart())
                          }
                          className="flex-1 px-3 py-2 border border-red-300/20 dark:border-red-600/20 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/20 dark:bg-gray-700/20 text-gray-900 dark:text-white backdrop-blur-sm text-sm"
                        />
                        <motion.button
                          onClick={handleDeleteAccount}
                          disabled={loading || !deletePassword}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <TrashIcon className="w-4 h-4" />
                          <span>
                            {loading ? "Suppression..." : "Supprimer"}
                          </span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "signout":
        handleSignOut();
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-gray-900 dark:to-blue-900 flex">
      {/* Sidebar mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden bg-gray-600/75"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : "-100%",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg shadow-lg lg:relative lg:translate-x-0 lg:flex-shrink-0"
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200/20 dark:border-gray-700/20">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Doualair Dashboard
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100/20 dark:hover:bg-gray-700/20"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeSection === item.id
                    ? "bg-blue-100/20 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/20 dark:hover:bg-gray-700/20"
                }`}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <div className="truncate">{item.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {item.description}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </nav>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border-b border-gray-200/20 dark:border-gray-700/20">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100/20 dark:hover:bg-gray-700/20"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {currentUser.photo ? (
                  <img
                    src={currentUser.photo}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatName(currentUser.name || currentUser.username)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {currentUser.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default DashBoard;
