import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
    >
      {isDark ? (
        <Sun style={{ width: '1.05rem', height: '1.05rem' }} aria-hidden="true" />
      ) : (
        <Moon style={{ width: '1.05rem', height: '1.05rem' }} aria-hidden="true" />
      )}
    </button>
  );
}
