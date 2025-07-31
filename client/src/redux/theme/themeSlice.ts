import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Liste des thèmes DaisyUI disponibles
export const DAISYUI_THEMES = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
] as const;

export type DaisyUITheme = (typeof DAISYUI_THEMES)[number];

interface ThemeState {
  currentTheme: DaisyUITheme;
}

// Récupérer le thème depuis localStorage ou utiliser le thème clair par défaut
const getInitialTheme = (): DaisyUITheme => {
  const savedTheme = localStorage.getItem("daisyui-theme");
  if (savedTheme && DAISYUI_THEMES.includes(savedTheme as DaisyUITheme)) {
    return savedTheme as DaisyUITheme;
  }
  // Thème clair par défaut
  return "light";
};

const initialState: ThemeState = {
  currentTheme: getInitialTheme(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<DaisyUITheme>) => {
      state.currentTheme = action.payload;
      // Sauvegarder dans localStorage
      localStorage.setItem("daisyui-theme", action.payload);
      // Appliquer le thème à l'élément HTML
      document.documentElement.setAttribute("data-theme", action.payload);
    },
    toggleDarkMode: (state) => {
      // Basculer entre light et dark
      const newTheme = state.currentTheme === "light" ? "dark" : "light";
      state.currentTheme = newTheme;
      localStorage.setItem("daisyui-theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    },
  },
});

export const { setTheme, toggleDarkMode } = themeSlice.actions;
export default themeSlice.reducer;
