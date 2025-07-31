import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "../redux/theme/themeSlice";

interface ThemeProviderProps {
  children: React.ReactNode;
}

interface RootState {
  theme: {
    isDarkMode: boolean;
  };
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const dispatch = useDispatch();
  const { isDarkMode } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    // Appliquer immédiatement la classe CSS basée sur l'état Redux
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Initialiser le thème au chargement de l'application
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      const isDark = savedTheme === "dark";
      dispatch(setTheme(isDark));
      // Appliquer immédiatement la classe
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // Mode clair par défaut
      dispatch(setTheme(false));
      // Appliquer immédiatement la classe
      document.documentElement.classList.remove("dark");
    }

    // Écouter les changements de préférence système
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem("theme");
      // Ne changer que si l'utilisateur n'a pas défini de préférence manuelle
      if (!savedTheme) {
        dispatch(setTheme(e.matches));
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [dispatch]);

  return <>{children}</>;
};

export default ThemeProvider;
