import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTheme, DAISYUI_THEMES } from "../redux/theme/themeSlice";
import type { DaisyUITheme } from "../redux/theme/themeSlice";

interface ThemeProviderProps {
  children: React.ReactNode;
}

interface RootState {
  theme: {
    currentTheme: string;
  };
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const dispatch = useDispatch();
  const { currentTheme } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    // Appliquer immédiatement le thème DaisyUI basé sur l'état Redux
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    // Initialiser le thème au chargement de l'application
    const savedTheme = localStorage.getItem("daisyui-theme");
    if (savedTheme && DAISYUI_THEMES.includes(savedTheme as DaisyUITheme)) {
      dispatch(setTheme(savedTheme as DaisyUITheme));
      // Appliquer immédiatement le thème
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      // Thème clair par défaut
      dispatch(setTheme("light"));
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, [dispatch]);

  return <>{children}</>;
};

export default ThemeProvider;
