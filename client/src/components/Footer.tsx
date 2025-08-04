import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPlane,
  FaRegCopyright,
  FaRocket,
  FaTwitter,
} from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { Link } from "react-router-dom";

// Types TypeScript
interface SocialLink {
  icon: React.ReactNode;
  color: string;
  label: string;
  href: string;
}

interface NavLink {
  name: string;
  path: string;
}

// Données centralisées pour réutilisation
const socialLinks: SocialLink[] = [
  {
    icon: <FaTwitter />,
    color: "hover:text-blue-400",
    label: "Twitter",
    href: "#",
  },
  {
    icon: <FaInstagram />,
    color: "hover:text-pink-500",
    label: "Instagram",
    href: "#",
  },
  {
    icon: <FaLinkedin />,
    color: "hover:text-blue-600",
    label: "LinkedIn",
    href: "#",
  },
  {
    icon: <FaGithub />,
    color: "hover:text-gray-300",
    label: "GitHub",
    href: "#",
  },
];

const navLinks: NavLink[] = [
  { name: "Accueil", path: "/" },
  { name: "À propos", path: "/about" },
  { name: "Projets", path: "/projects" },
];

const legalLinks = ["Mentions légales", "Confidentialité", "CGU", "Cookies"];

// Variants d'animation pour cohérence
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Composant pour les icônes sociales
const SocialIcon = ({ icon, color, label, href }: SocialLink) => (
  <motion.a
    href={href}
    className={`text-base-content/60 text-xl transition-colors ${color}`}
    whileHover={{ y: -5, scale: 1.2 }}
    transition={{ type: "spring" as const, stiffness: 300 }}
    title={label}
  >
    {icon}
  </motion.a>
);

// Composant pour les liens de navigation
const NavLinkComponent = ({ name, path }: NavLink) => (
  <motion.li
    whileHover={{ x: 5 }}
    transition={{ type: "spring" as const, stiffness: 300 }}
  >
    <Link
      to={path}
      className="text-base-content/70 hover:text-primary transition-colors text-sm flex items-center group"
    >
      <motion.span
        className="inline-block w-3 h-3 bg-primary rounded-full mr-3 group-hover:bg-secondary"
        whileHover={{ scale: 1.5 }}
      />
      {name}
    </Link>
  </motion.li>
);

// Composant principal du Footer
const Footer = () => {
  return (
    <footer className="bg-base-300 text-base-content p-10">
      {/* Container avec espacement équilibré */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Section Logo et Description */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center">
              <motion.div
                className="bg-gradient-to-br from-primary to-secondary p-2 rounded-xl mr-4"
                whileHover={{
                  rotate: [0, 10, -10, 5, 0],
                  transition: { duration: 0.8 },
                }}
              >
                <img
                  src="/dlair.svg"
                  alt="Doualair Logo"
                  className="w-10 h-10"
                />
              </motion.div>
              <motion.span
                className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                whileHover={{ textShadow: "0 0 10px rgba(96, 165, 250, 0.5)" }}
                transition={{ duration: 0.3 }}
              >
                Doualair Blog
              </motion.span>
            </div>
            <p className="text-sm leading-relaxed opacity-70">
              Votre source d'informations sur l'aéronautique, les innovations
              technologiques et les actualités du secteur aérien.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <SocialIcon key={index} {...social} />
              ))}
            </div>
          </motion.div>

          {/* Section Navigation */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-bold text-primary flex items-center">
              <FaPlane className="mr-2 transform -rotate-45" />
              Navigation
            </h3>
            <ul className="space-y-3">
              {navLinks.map((item, index) => (
                <NavLinkComponent key={index} {...item} />
              ))}
            </ul>
          </motion.div>

          {/* Section Contact */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-bold text-primary flex items-center">
              <FaEnvelope className="mr-2" />
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-primary mt-1 mr-3 text-lg" />
                <span className="text-sm opacity-70">Douala, Cameroun</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-primary mr-3 text-lg" />
                <span className="text-sm opacity-70">
                  contact@doualair-blog.com
                </span>
              </li>
            </ul>
            <div className="card bg-base-200 shadow-xl p-4">
              <div className="flex items-center text-sm text-primary mb-2">
                <span className="flex space-x-1 mr-2">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-success"
                      animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                </span>
                Assistance en ligne 24/7
              </div>
              <p className="text-xs opacity-60">
                Notre équipe est disponible pour répondre à vos questions
              </p>
            </div>
          </motion.div>

          {/* Section Newsletter */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6, duration: 0.6 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-bold text-primary">Newsletter</h3>
            <p className="text-sm opacity-70">
              Restez informé des dernières actualités aéronautiques.
            </p>
            <div className="relative">
              <input
                type="email"
                placeholder="Votre email"
                className="input input-bordered w-full pr-12"
              />
              <motion.button
                className="absolute right-0 top-0 btn btn-primary"
                whileHover={{ rotate: 15, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiSend />
              </motion.button>
            </div>
            <div className="card bg-base-200 shadow-xl p-4">
              <p className="text-sm text-primary mb-2 flex items-center">
                <FaRocket className="text-warning mr-2 animate-pulse" />
                Offre spéciale pour les abonnés
              </p>
              <p className="text-xs opacity-60">
                Recevez un e-book exclusif sur l'histoire de l'aviation
              </p>
            </div>
          </motion.div>
        </div>

        {/* Section Copyright */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-base-content/20 mt-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="flex items-center text-sm opacity-70 mb-4 md:mb-0">
            <FaRegCopyright className="mr-2" />
            <span>© 2025 Doualair Blog. Tous droits réservés.</span>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            {legalLinks.map((item, index) => (
              <a
                key={index}
                href="#"
                className="text-sm opacity-70 hover:text-primary transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
