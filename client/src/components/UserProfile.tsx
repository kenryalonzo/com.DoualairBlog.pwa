import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { signOutSuccess } from "../redux/user/userSlice";
import { toast } from "react-toastify";

interface User {
  _id: string;
  username: string;
  name?: string;
  email: string;
  photo?: string;
}

interface RootState {
  user: {
    currentUser: User | null;
  };
}

const UserProfile = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
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
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion", {
        position: "top-right",
        autoClose: 3000,
      });
    }
    setIsDropdownOpen(false);
  };

  const handleProfileClick = () => {
    navigate("/dashboard");
    setIsDropdownOpen(false);
  };

  // Formater le nom complet
  const formatName = (name: string | undefined | null) => {
    if (!name || typeof name !== 'string') {
      return 'Utilisateur';
    }
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton profil avec photo */}
      <motion.button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          {currentUser.photo ? (
            <img
              src={currentUser.photo}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
        </div>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          >
            {/* En-tête du profil */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {currentUser.photo ? (
                    <img
                      src={currentUser.photo}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {formatName(currentUser.name || currentUser.username)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {currentUser.email || 'Email non disponible'}
                  </p>
                </div>
              </div>
            </div>

            {/* Options du menu */}
            <div className="py-2">
              <motion.button
                onClick={handleProfileClick}
                className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                whileHover={{ x: 4 }}
              >
                <UserIcon className="w-5 h-5 mr-3 text-gray-500" />
                Profile
              </motion.button>

              <motion.button
                onClick={handleSignOut}
                className="w-full flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                whileHover={{ x: 4 }}
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                Sign out
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;