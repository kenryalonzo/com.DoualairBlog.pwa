import { motion } from "framer-motion";
import {
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaRegCopyright,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPlane,
  FaRocket
} from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white overflow-hidden">
      {/* Vague animée en haut */}
      <div className="absolute top-0 left-0 w-full h-24 -mt-24 overflow-hidden">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="absolute top-0 left-0 w-full h-full"
        >
          <motion.path 
            fill="#111827"
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity="0.25"
            animate={{ d: [
              "M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z",
              "M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z",
              "M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            ]}}
            transition={{
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        </svg>
      </div>

      {/* Éléments décoratifs animés */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => {
          const size = Math.random() * 60 + 20;
          const delay = Math.random() * 5;
          const duration = Math.random() * 10 + 15;
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-blue-500 opacity-10"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, -200, -300],
                x: [0, Math.random() * 100 - 50, 0],
                scale: [1, 1.2, 1.5, 2],
                opacity: [0.1, 0.3, 0.2, 0],
              }}
              transition={{
                duration,
                delay,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>

      {/* Avion animé traversant l'écran */}
      <motion.div
        className="absolute top-1/4 -left-20 text-cyan-400 text-3xl z-0"
        animate={{
          x: [0, window.innerWidth + 100],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <FaPlane className="transform -rotate-45" />
      </motion.div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo et description */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center">
              <motion.div
                className="bg-gradient-to-br from-blue-600 to-cyan-500 p-2 rounded-xl mr-4"
                whileHover={{ 
                  rotate: [0, 10, -10, 5, 0],
                  transition: { duration: 0.8 }
                }}
              >
                <img src="/dlair.svg" alt="Doualair Logo" className="w-10 h-10" />
              </motion.div>
              <motion.span
                className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent"
                whileHover={{
                  textShadow: "0 0 10px rgba(96, 165, 250, 0.5)",
                  transition: { duration: 0.3 }
                }}
              >
                Doualair Blog
              </motion.span>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed">
              Votre source d'informations sur l'aéronautique, les innovations
              technologiques et les actualités du secteur aérien. Découvrez les
              dernières tendances et analyses du monde de l'aviation.
            </p>

            <div className="flex space-x-4">
              {[
                {
                  icon: <FaTwitter />,
                  color: "hover:text-blue-400",
                  label: "Twitter",
                },
                {
                  icon: <FaInstagram />,
                  color: "hover:text-pink-500",
                  label: "Instagram",
                },
                {
                  icon: <FaLinkedin />,
                  color: "hover:text-blue-600",
                  label: "LinkedIn",
                },
                {
                  icon: <FaGithub />,
                  color: "hover:text-gray-300",
                  label: "GitHub",
                },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className={`text-gray-400 text-xl transition-colors ${social.color}`}
                  whileHover={{
                    y: -5,
                    scale: 1.2,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  title={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Navigation du blog */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h3 className="text-lg font-bold mb-4 text-cyan-400 flex items-center">
              <FaPlane className="mr-2 transform -rotate-45" />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Navigation
              </span>
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Accueil", path: "/" },
                { name: "Articles", path: "/projects" },
                { name: "À propos", path: "/about" },
                { name: "Dashboard", path: "/dashboard" },
                { name: "Connexion", path: "/sign-in" },
                { name: "Inscription", path: "/sign-up" },
              ].map((item, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link
                    to={item.path}
                    className="text-gray-300 hover:text-cyan-400 transition-colors text-sm flex items-center group"
                  >
                    <motion.span 
                      className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-3 group-hover:bg-cyan-400"
                      whileHover={{ scale: 1.5 }}
                    />
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h3 className="text-lg font-bold mb-4 text-cyan-400 flex items-center">
              <FaEnvelope className="mr-2" />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Contact
              </span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-cyan-400 mt-1 mr-3 text-lg" />
                <span className="text-gray-300 text-sm">
                  Douala, Cameroun
                </span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-cyan-400 mr-3 text-lg" />
                <span className="text-gray-300 text-sm">
                  contact@doualair-blog.com
                </span>
              </li>
            </ul>
            
            <div className="mt-4 p-4 bg-gradient-to-br from-blue-900/50 to-cyan-900/30 rounded-xl border border-cyan-700/30">
              <div className="text-sm text-cyan-200 mb-2 flex items-center">
                <span className="flex space-x-1 mr-2">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-green-400"
                      animate={{ 
                        opacity: [0.3, 1, 0.3],
                        scale: [0.8, 1.2, 0.8]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        delay: i * 0.3
                      }}
                    />
                  ))}
                </span>
                Assistance en ligne 24/7
              </div>
              <p className="text-xs text-gray-400">
                Notre équipe est disponible pour répondre à vos questions
              </p>
            </div>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <h3 className="text-lg font-bold mb-4 text-cyan-400">
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Newsletter
              </span>
            </h3>
            <p className="text-gray-300 text-sm">
              Restez informé des dernières actualités aéronautiques et des nouveaux articles.
            </p>
            
            <div className="relative">
              <input
                type="email"
                placeholder="Votre email"
                className="w-full bg-gray-800/50 border border-cyan-700/50 rounded-full py-3 px-5 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
              />
              <motion.button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full p-2"
                whileHover={{ 
                  rotate: 15, 
                  scale: 1.1,
                  boxShadow: "0 0 15px rgba(56, 189, 248, 0.5)"
                }}
                whileTap={{ scale: 0.9 }}
              >
                <FiSend className="text-white" />
              </motion.button>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-xl border border-cyan-700/30">
              <p className="text-sm text-cyan-200 mb-2 flex items-center">
                <FaRocket className="text-yellow-400 mr-2 animate-pulse" />
                Offre spéciale pour les abonnés
              </p>
              <p className="text-xs text-gray-400">
                Recevez un e-book exclusif sur l'histoire de l'aviation
              </p>
            </div>
          </motion.div>
        </div>
        
        {/* Séparateur animé */}
        <motion.div 
          className="my-12 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        />
        
        {/* Copyright et liens légaux */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-4">
          <motion.div
            className="flex items-center text-gray-400 text-sm mb-4 md:mb-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
          >
            <FaRegCopyright className="mr-2" />
            <span>2025 Doualair Blog. Tous droits réservés.</span>
          </motion.div>
          
          <motion.div 
            className="flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
          >
            {["Mentions légales", "Confidentialité", "CGU", "Cookies"].map((item, index) => (
              <a 
                key={index}
                href="#"
                className="text-gray-400 hover:text-cyan-400 text-sm transition-colors"
              >
                {item}
              </a>
            ))}
          </motion.div>
        </div>
      </div>
      
      {/* Élément flottant */}
      <motion.div
        className="absolute bottom-10 right-10 hidden lg:block z-20"
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full p-4 shadow-xl">
          <FaPlane className="text-xl" />
        </div>
      </motion.div>
    </div>
  );
};

export default Footer;