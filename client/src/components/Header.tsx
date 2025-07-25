import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { SunIcon, MoonIcon, MagnifyingGlassIcon, XMarkIcon, Bars3Icon, SparklesIcon } from '@heroicons/react/24/outline';

const navLinks = [
  { name: 'Accueil', path: '/' },
  { name: 'À propos', path: '/about' },
  { name: 'Projets', path: '/projects' },
  { name: 'Contact', path: '/contact' },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);
  const location = useLocation();
  const particlesRef = useRef<HTMLDivElement>(null);

  // Créer des particules animées autour du logo au survol
  useEffect(() => {
    if (!particlesRef.current || !isHoveringLogo) return;
    
    const particles = particlesRef.current;
    particles.innerHTML = '';
    
    const particleCount = 12;
    const colors = ['#60a5fa', '#38bdf8', '#22d3ee', '#818cf8'];
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute rounded-full';
      
      const size = Math.random() * 4 + 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      
      // Position initiale aléatoire
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 30 + 15;
      
      particle.style.left = `50%`;
      particle.style.top = `50%`;
      particle.style.transform = `translate(-50%, -50%)`;
      
      // Animation
      particle.animate([
        { 
          transform: `translate(-50%, -50%) translate(0, 0)`,
          opacity: 0
        },
        { 
          transform: `translate(-50%, -50%) translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`,
          opacity: 1
        },
        { 
          transform: `translate(-50%, -50%) translate(${Math.cos(angle) * (distance + 10)}px, ${Math.sin(angle) * (distance + 10)}px)`,
          opacity: 0
        }
      ], {
        duration: 1000 + Math.random() * 1000,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        iterations: Infinity
      });
      
      particles.appendChild(particle);
    }
    
    return () => {
      particles.innerHTML = '';
    };
  }, [isHoveringLogo]);

  // Gestion du défilement
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Basculement du mode sombre
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Animation de la barre de recherche
  const searchBarVariants = {
    hidden: { 
      width: 0, 
      opacity: 0, 
      marginLeft: 0 
    },
    visible: { 
      width: 'auto', 
      opacity: 1,
      marginLeft: '1rem',
      transition: { 
        type: 'spring', 
        stiffness: 100, 
        damping: 15 
      } 
    }
  };

  // Animation des liens de navigation
  const linkVariants = {
    rest: { 
      y: 0,
      scale: 1
    },
    hover: { 
      y: -5,
      scale: 1.05,
      textShadow: '0 0 8px rgba(96, 165, 250, 0.7)',
      transition: { 
        type: 'spring', 
        stiffness: 400,
        damping: 10
      }
    },
    tap: { 
      scale: 0.95 
    }
  };

  // Animation du menu mobile
  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      height: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const mobileLinkVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 }
  };

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo avec effet de particules */}
          <motion.div 
            className="flex-shrink-0 flex items-center relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onHoverStart={() => setIsHoveringLogo(true)}
            onHoverEnd={() => setIsHoveringLogo(false)}
          >
            <Link to="/" className="flex items-center">
              <div className="relative">
                <motion.img
                  className="h-10 w-auto z-10 relative"
                  src="/dlair.svg"
                  alt="Doualair Logo"
                  whileHover={{ 
                    rotate: [0, 10, -10, 5, 0],
                    transition: { duration: 0.8 }
                  }}
                  whileTap={{ scale: 0.95 }}
                />
                <div 
                  ref={particlesRef} 
                  className="absolute inset-0 z-0 pointer-events-none"
                />
              </div>
              <motion.span 
                className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent"
                whileHover={{
                  textShadow: '0 0 10px rgba(96, 165, 250, 0.5)',
                  transition: { duration: 0.3 }
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
                      ? 'text-blue-600 dark:text-cyan-400 font-bold'
                      : 'text-gray-700 dark:text-gray-300'
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
                          type: 'spring', 
                          bounce: 0.4, 
                          duration: 0.8 
                        }
                      }}
                      exit={{ scale: 0.8, opacity: 0 }}
                    />
                  )}
                </AnimatePresence>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-400/10 dark:from-blue-600/20 dark:to-cyan-500/20 rounded-full opacity-0"
                  whileHover={{ 
                    opacity: 1,
                    transition: { duration: 0.3 }
                  }}
                />
              </motion.div>
            ))}
          </nav>

          {/* Barre de recherche et boutons */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <AnimatePresence mode="wait">
                {isSearchOpen ? (
                  <motion.div
                    className="relative"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={searchBarVariants}
                  >
                    <motion.input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-48 sm:w-56 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-inner"
                      placeholder="Rechercher..."
                      autoFocus
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: 1,
                        transition: { delay: 0.2 }
                      }}
                    />
                    <motion.button
                      onClick={() => setIsSearchOpen(false)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      whileHover={{ rotate: 90, scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 rounded-full text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-cyan-400"
                    whileHover={{ 
                      scale: 1.2,
                      rotate: 15,
                      transition: { 
                        type: 'spring',
                        stiffness: 500
                      }
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </motion.button>
                )}
              </AnimatePresence>

              <motion.button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-cyan-400 ml-2"
                whileHover={{ scale: 1.2, rotate: darkMode ? 0 : 180 }}
                whileTap={{ scale: 0.9 }}
                animate={{ rotate: darkMode ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {darkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  background: [
                    'linear-gradient(to right, #3b82f6, #60a5fa)',
                    'linear-gradient(to right, #60a5fa, #38bdf8)',
                    'linear-gradient(to right, #38bdf8, #22d3ee)',
                    'linear-gradient(to right, #22d3ee, #818cf8)',
                    'linear-gradient(to right, #818cf8, #3b82f6)'
                  ],
                  transition: { 
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }
                }}
                whileTap={{ scale: 0.95 }}
                className="ml-4 hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-lg text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 focus:outline-none"
              >
                <SparklesIcon className="h-4 w-4 mr-1" />
                <span>Se connecter</span>
              </motion.button>
            </div>

            {/* Bouton menu mobile - Animation transformée en croix */}
            <motion.button
              className="md:hidden p-2 text-gray-700 dark:text-gray-300 rounded-full"
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
                    open: { d: "M6 18L18 6M6 6L18 18" }
                  }}
                  transition={{ duration: 0.3 }}
                />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Menu mobile - Animation de déploiement fluide */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden bg-white dark:bg-gray-900 overflow-hidden"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={mobileMenuVariants}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
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
                        ? 'bg-blue-50 text-blue-700 dark:bg-gray-800 dark:text-cyan-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <motion.span 
                      className="ml-2"
                      whileHover={{ x: 5 }}
                    >
                      {link.name}
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
              <motion.div
                variants={mobileLinkVariants}
                className="block px-3 py-2 mt-4"
              >
                <button
                  onClick={() => {
                    // TODO: Gérer la connexion
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex justify-center items-center px-4 py-3 rounded-full text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md"
                >
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  Se connecter
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;