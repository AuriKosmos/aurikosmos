import { createContext, useContext, useEffect, useState } from 'react'

/**
 * Sistema de tema claro/oscuro de Auri Kosmos.
 *
 * Guarda la preferencia en localStorage ('auri-theme') y aplica la clase
 * `dark` en <html> para que todas las utilidades `dark:` de Tailwind
 * reaccionen. Si el usuario nunca eligió nada, se respeta su preferencia
 * del sistema operativo (prefers-color-scheme) la primera vez.
 *
 * IMPORTANTE: las hojas imprimibles (.printable) de los generadores del
 * Laboratorio se quedan SIEMPRE claras a propósito — nadie imprime un
 * diploma con fondo negro. Por eso ese contenido no lleva clases `dark:`.
 *
 * Ver también el script inline en index.html, que aplica la clase antes
 * de que React monte, para evitar el "flash" de tema incorrecto al cargar.
 */

const STORAGE_KEY = 'auri-theme'
const ThemeContext = createContext(null)

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>')
  return ctx
}
