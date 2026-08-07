import { useTheme } from '../../app/ThemeContext.jsx'

/**
 * Interruptor de tema claro/oscuro, estilo pixel — un sol en modo claro,
 * una luna en modo oscuro. Vive en el Navbar, siempre a mano.
 */
export function PixelThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className={`w-9 h-9 shrink-0 flex items-center justify-center border-2 border-deep bg-white text-deep hover:bg-sky/30 dark:border-cream/40 dark:bg-deep dark:text-cream dark:hover:bg-cream/10 transition-colors ${className}`}
    >
      <span className="text-base leading-none" aria-hidden="true">
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
