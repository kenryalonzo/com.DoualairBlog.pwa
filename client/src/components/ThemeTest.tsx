import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice";

interface RootState {
  theme: {
    isDarkMode: boolean;
  };
}

const ThemeTest = () => {
  const dispatch = useDispatch();
  const { isDarkMode } = useSelector((state: RootState) => state.theme);

  const clearTheme = () => {
    localStorage.removeItem("theme");
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
      <h3 className="font-bold text-gray-900 dark:text-white mb-2">Test Thème</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
        Mode actuel : {isDarkMode ? "Sombre" : "Clair"}
      </p>
      <div className="space-y-2">
        <button
          onClick={() => dispatch(toggleTheme())}
          className="w-full px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Toggle Thème
        </button>
        <button
          onClick={clearTheme}
          className="w-full px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Reset Thème
        </button>
      </div>
      <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
        <p className="text-gray-700 dark:text-gray-300">
          Background clair/sombre pour test visuel
        </p>
      </div>
    </div>
  );
};

export default ThemeTest;
