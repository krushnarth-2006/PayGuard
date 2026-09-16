import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
