import { MagnifyingGlassIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import ThemeDropdown from "./ThemeDropdown";
import UserProfile from "./UserProfile";

interface User {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  photo?: string;
}

interface RootState {
  user: {
    currentUser: User | null;
  };
  theme: {
    currentTheme: string;
  };
}

const navLinks = [
  { name: "Accueil", path: "/" },
  { name: "À propos", path: "/about" },
  { name: "Projets", path: "/projects" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);
  const location = useLocation();
  const particlesRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useSelector((state: RootState) => state.user);

  // Créer des particules animées autour du logo au survol
  useEffect(() => {
    if (!particlesRef.current || !isHoveringLogo) return;

    const particles = particlesRef.current;
    particles.innerHTML = "";

    const particleCount = 16;
    const colors = [
      "#60a5fa", // blue-400
      "#38bdf8", // sky-400
      "#22d3ee", // cyan-400
      "#818cf8", // indigo-400
      "#a855f7", // purple-500
      "#ec4899", // pink-500
    ];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "absolute rounded-full";

      const size = Math.random() * 6 + 2;
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;

      // Position initiale aléatoire
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 40 + 20;

      particle.style.left = `50%`;
      particle.style.top = `50%`;
      particle.style.transform = `translate(-50%, -50%)`;

      // Animation avec effet de rebond
      particle.animate(
        [
          {
            transform: `translate(-50%, -50%) translate(0, 0)`,
            opacity: 0,
            scale: 0,
          },
          {
            transform: `translate(-50%, -50%) translate(${
              Math.cos(angle) * distance * 0.7
            }px, ${Math.sin(angle) * distance * 0.7}px)`,
            opacity: 1,
            scale: 1,
          },
          {
            transform: `translate(-50%, -50%) translate(${
              Math.cos(angle) * distance
            }px, ${Math.sin(angle) * distance}px)`,
            opacity: 0.8,
            scale: 0.8,
          },
          {
            transform: `translate(-50%, -50%) translate(${
              Math.cos(angle) * (distance + 15)
            }px, ${Math.sin(angle) * (distance + 15)}px)`,
            opacity: 0,
            scale: 0,
          },
        ],
        {
          duration: 1200 + Math.random() * 800,
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          iterations: Infinity,
          delay: Math.random() * 200,
        }
      );

      particles.appendChild(particle);
    }

    return () => {
      particles.innerHTML = "";
    };
  }, [isHoveringLogo]);

  // Gestion du défilement
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Le thème est maintenant géré par Redux, pas besoin de useEffect local

  // Animation des liens de navigation
  const linkVariants = {
    rest: {
      y: 0,
      scale: 1,
    },
    hover: {
      y: -5,
      scale: 1.05,
      textShadow: "0 0 8px rgba(96, 165, 250, 0.7)",
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 10,
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  // Animation du menu mobile
  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const mobileLinkVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-700 ${
        isScrolled
          ? "bg-gradient-to-r from-white/95 via-white/90 to-white/95 dark:from-gray-900/95 dark:via-gray-800/90 dark:to-gray-900/95 backdrop-blur-xl shadow-2xl border-b border-white/20 dark:border-gray-700/30 py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo avec effet de particules amélioré */}
          <motion.div
            className="flex-shrink-0 flex items-center relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onHoverStart={() => setIsHoveringLogo(true)}
            onHoverEnd={() => setIsHoveringLogo(false)}
          >
            <Link to="/" className="flex items-center group">
              <div className="relative">
                {/* Logo principal avec animation fluide */}
                <motion.img
                  className="h-12 w-auto z-10 relative drop-shadow-lg filter brightness-100 group-hover:brightness-110"
                  src="/dlair.svg"
                  alt="Doualair Logo"
                  whileHover={{
                    rotate: [0, 8, -8, 4, 0],
                    scale: 1.15,
                    filter:
                      "brightness(1.2) drop-shadow(0 0 8px rgba(96, 165, 250, 0.6))",
                    transition: {
                      duration: 0.6,
                      ease: "easeInOut",
                    },
                  }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    filter: isHoveringLogo
                      ? "drop-shadow(0 0 12px rgba(96, 165, 250, 0.8))"
                      : "drop-shadow(0 0 4px rgba(0, 0, 0, 0.1))",
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Effet de particules */}
                <div
                  ref={particlesRef}
                  className="absolute inset-0 z-0 pointer-events-none"
                />

                {/* Effet de lueur autour du logo */}
                <motion.div
                  className="absolute inset-0 rounded-full opacity-0"
                  animate={{
                    opacity: isHoveringLogo ? 0.3 : 0,
                    scale: isHoveringLogo ? 1.5 : 1,
                  }}
                  transition={{ duration: 0.4 }}
                  style={{
                    background:
                      "radial-gradient(circle, rgba(96, 165, 250, 0.4) 0%, transparent 70%)",
                  }}
                />
              </div>

              {/* Texte du logo avec animation améliorée */}
              <motion.span
                className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 bg-clip-text text-transparent drop-shadow-sm"
                whileHover={{
                  textShadow: "0 0 20px rgba(96, 165, 250, 0.8)",
                  scale: 1.05,
                  transition: { duration: 0.3 },
                }}
                animate={{
                  backgroundPosition: isHoveringLogo ? "100% 0%" : "0% 0%",
                }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: isHoveringLogo ? Infinity : 0,
                  repeatType: "reverse",
                }}
                style={{
                  backgroundSize: "200% 100%",
                }}
              >
                Doualair
              </motion.span>
            </Link>
          </motion.div>

          {/* Navigation Desktop - Effet "liquide" */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <motion.div
                key={link.path}
                variants={linkVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                className="relative overflow-hidden"
              >
                <Link
                  to={link.path}
                  className={`px-4 py-2 text-sm font-medium transition-colors relative z-10 ${
                    location.pathname === link.path
                      ? "text-blue-600 dark:text-cyan-400 font-bold"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {link.name}
                </Link>
                <AnimatePresence>
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute bottom-0 left-0 w-full h-full bg-blue-100 dark:bg-blue-900/40 rounded-full z-0"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        transition: {
                          type: "spring",
                          bounce: 0.4,
                          duration: 0.8,
                        },
                      }}
                      exit={{ scale: 0.8, opacity: 0 }}
                    />
                  )}
                </AnimatePresence>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-400/10 dark:from-blue-600/20 dark:to-cyan-500/20 rounded-full opacity-0"
                  whileHover={{
                    opacity: 1,
                    transition: { duration: 0.3 },
                  }}
                />
              </motion.div>
            ))}
          </nav>

          {/* Contenu principal du header - Desktop uniquement */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Barre de recherche */}
            <AnimatePresence mode="wait">
              {isSearchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="relative"
                >
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-blue-500 text-sm"
                    autoFocus
                  />
                  <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bouton de recherche */}
            <AnimatePresence mode="wait">
              {!isSearchOpen && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </motion.button>
              )}
            </AnimatePresence>

            <ThemeDropdown />

            {/* Bouton profil utilisateur (visible seulement si connecté) */}
            {currentUser && (
              <div>
                <UserProfile />
              </div>
            )}
          </div>

          {/* Bouton profil utilisateur mobile (visible seulement si connecté) */}
          {currentUser && (
            <div className="md:hidden mr-2">
              <UserProfile />
            </div>
          )}

          {/* Bouton menu mobile - Simple et épuré */}
          <motion.button
            className="md:hidden p-2 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={mobileMenuOpen ? "open" : "closed"}
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <motion.path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                variants={{
                  closed: { d: "M3 12H21 M3 6H21 M3 18H21" },
                  open: { d: "M6 18L18 6M6 6L18 18" },
                }}
                transition={{ duration: 0.3 }}
              />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Menu mobile - Animation de déploiement fluide */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden bg-white dark:bg-gray-900 overflow-hidden border-t border-gray-200 dark:border-gray-700"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={mobileMenuVariants}
          >
            <div className="px-4 py-6 space-y-4">
              {/* Navigation principale */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">
                  Navigation
                </h3>
                {navLinks.map((link) => (
                  <motion.div
                    key={link.path}
                    variants={mobileLinkVariants}
                    className="block"
                  >
                    <Link
                      to={link.path}
                      className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        location.pathname === link.path
                          ? "bg-blue-50 text-blue-700 dark:bg-gray-800 dark:text-cyan-400"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <motion.span className="ml-2" whileHover={{ x: 5 }}>
                        {link.name}
                      </motion.span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Barre de recherche mobile */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">
                  Recherche
                </h3>
                <div className="px-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Thème mobile */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">
                  Apparence
                </h3>
                <div className="px-3">
                  <ThemeDropdown />
                </div>
              </div>

              {/* Connexion (visible seulement si non connecté) */}
              {!currentUser && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">
                    Compte
                  </h3>
                  <motion.div
                    variants={mobileLinkVariants}
                    className="block px-3"
                  >
                    <Link
                      to="/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex justify-center items-center px-4 py-3 rounded-lg text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md"
                    >
                      <SparklesIcon className="h-5 w-5 mr-2" />
                      Se connecter
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
