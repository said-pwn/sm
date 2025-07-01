import { useContext } from "react";
import { ThemeContext } from "./ThemeProvider";

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="text-sm px-3 py-1 rounded border dark:border-gray-600 border-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      {theme === "light" ? "🌙 Тёмная" : "☀️ Светлая"}
    </button>
  );
}
// This component allows users to switch between light and dark themes.