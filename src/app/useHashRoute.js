import { useEffect, useState } from 'react'

/**
 * Ruta actual basada en window.location.hash, reactiva a hashchange.
 * Vivía antes como función privada dentro de App.jsx — se separó porque
 * es routing, no un componente, y así App.jsx queda más chico y fácil
 * de leer de punta a punta.
 */
export function useHashRoute() {
  const [route, setRoute] = useState(window.location.hash || '#/')
  useEffect(() => {
    const onChange = () => setRoute(window.location.hash || '#/')
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
