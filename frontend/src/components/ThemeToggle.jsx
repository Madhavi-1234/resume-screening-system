import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onToggle}
      className="glass-panel flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-100"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </motion.button>
  );
}
