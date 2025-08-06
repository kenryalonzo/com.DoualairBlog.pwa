import {
  ArrowRightOnRectangleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useToastContext } from "../contexts/ToastContext";
import { useAuth } from "../hooks/useAuth";

interface User {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  photo?: string;
  avatar?: string;
}

interface RootState {
  user: {
    currentUser: User | null;
  };
}

const UserProfile = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { user: authUser, logout } = useAuth();
  const { toast } = useToastContext();

  // Helper to format name
  const formatName = (user: User | null) => {
    if (!user) return "Utilisateur";
    if (user.firstName && user.lastName)
      return `${user.firstName} ${user.lastName}`;
    if (user.name) return user.name;
    return user.username || "Utilisateur";
  };

  // Handle profile click - navigate selon le rôle
  const handleProfileClick = () => {
    if (authUser?.role === "admin") {
      navigate("/dashboard");
    } else {
      navigate("/profile");
    }
    setIsDropdownOpen(false);
  };

  // Handle sign out - Déconnexion unifiée
  const handleSignOut = () => {
    logout(); // Nettoie JWT + Redux
    navigate("/");
    toast.success("Déconnexion réussie !");
    setIsDropdownOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="btn btn-ghost btn-circle avatar relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Menu utilisateur"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <div className="w-8 rounded-full">
          {currentUser?.photo || currentUser?.avatar ? (
            <img
              src={currentUser.photo || currentUser.avatar}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring ring-primary ring-offset-base-100 ring-offset-2"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-primary-content" />
            </div>
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-base-100"></div>
      </motion.button>

      <AnimatePresence>
        {isDropdownOpen && (
          <div>
            {/* Overlay pour mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsDropdownOpen(false)}
            />
            {/* Menu dropdown */}
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 mt-2 w-72 bg-base-100 rounded-lg shadow-xl border border-base-300 z-50 overflow-hidden"
              style={{
                maxHeight: "calc(100vh - 200px)",
                overflowY: "auto",
                transformOrigin: "top right",
                right: "-1rem",
              }}
            >
              {/* En-tête du profil avec informations simplifiées */}
              <div className="p-4 border-b border-base-300 bg-gradient-to-r from-base-100 to-base-200">
                <div className="flex items-center space-x-3">
                  <div className="avatar">
                    <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      {currentUser?.photo || currentUser?.avatar ? (
                        <img
                          src={currentUser.photo || currentUser.avatar}
                          alt="Profile"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-primary-content" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-base-100"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-base-content">
                      {formatName(currentUser)}
                    </p>
                    <p className="text-xs opacity-70 truncate text-base-content/70">
                      {currentUser?.email || "email@example.com"}
                    </p>
                  </div>
                </div>
              </div>
              {/* Options du menu simplifiées */}
              <div className="p-2">
                <motion.button
                  onClick={handleProfileClick}
                  className={`w-full flex items-center px-3 py-3 text-sm rounded-lg transition-colors duration-200 ${
                    location.pathname === "/dashboard"
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-base-200 text-base-content"
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <UserIcon className="w-5 h-5 mr-3 text-primary" />
                  <span className="flex-1 text-left">Mon Profil</span>
                  {location.pathname === "/dashboard" && (
                    <motion.div
                      className="w-2 h-2 bg-primary rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                    />
                  )}
                </motion.button>
                <div className="border-t border-base-300 my-2"></div>
                <motion.button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-3 py-3 text-sm rounded-lg hover:bg-error/10 text-error transition-colors duration-200"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                  <span className="flex-1 text-left">Se déconnecter</span>
                  <motion.div
                    className="w-2 h-2 bg-error rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  />
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
