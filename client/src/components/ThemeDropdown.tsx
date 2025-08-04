import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { DaisyUITheme } from "../redux/theme/themeSlice";
import { DAISYUI_THEMES, setTheme } from "../redux/theme/themeSlice";

interface RootState {
  theme: {
    currentTheme: DaisyUITheme;
  };
}

// Noms d'affichage pour les thèmes
const themeNames: Record<DaisyUITheme, string> = {
  light: "Clair",
  dark: "Sombre",
  cupcake: "Cupcake",
  bumblebee: "Bumblebee",
  emerald: "Emeraude",
  corporate: "Corporate",
  synthwave: "Synthwave",
  retro: "Rétro",
  cyberpunk: "Cyberpunk",
  valentine: "Valentin",
  halloween: "Halloween",
  garden: "Jardin",
  forest: "Forêt",
  aqua: "Aqua",
  lofi: "Lo-Fi",
  pastel: "Pastel",
  fantasy: "Fantasy",
  wireframe: "Wireframe",
  black: "Noir",
  luxury: "Luxe",
  dracula: "Dracula",
  cmyk: "CMYK",
  autumn: "Automne",
  business: "Business",
  acid: "Acide",
  lemonade: "Limonade",
  night: "Nuit",
  coffee: "Café",
  winter: "Hiver",
};

const ThemeDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const { currentTheme } = useSelector((state: RootState) => state.theme);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleThemeChange = (theme: DaisyUITheme) => {
    dispatch(setTheme(theme));
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-base-200 hover:bg-base-300 transition-all duration-200 border border-base-300 hover:border-primary/30"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="w-4 h-4 rounded-full bg-primary shadow-sm"></div>
        <span className="text-sm font-medium text-base-content">
          {themeNames[currentTheme]}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="w-4 h-4 text-base-content" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-64 bg-base-100 border border-base-300 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto backdrop-blur-sm"
          >
            <div className="p-2">
              <div className="grid grid-cols-1 gap-1">
                {DAISYUI_THEMES.map((theme) => (
                  <motion.button
                    key={theme}
                    onClick={() => handleThemeChange(theme)}
                    className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md text-left transition-all duration-200 ${
                      currentTheme === theme
                        ? "bg-primary text-primary-content shadow-sm"
                        : "hover:bg-base-200 hover:shadow-sm"
                    }`}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <div className="w-3 h-3 rounded-full bg-secondary"></div>
                      <div className="w-3 h-3 rounded-full bg-accent"></div>
                    </div>
                    <span className="text-sm">{themeNames[theme]}</span>
                    {currentTheme === theme && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto"
                      >
                        <div className="w-2 h-2 rounded-full bg-current"></div>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeDropdown;
