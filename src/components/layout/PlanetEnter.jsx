import { useEffect, useState } from 'react'

/**
 * Animación de entrada para las páginas "planeta" (Laboratorio, Observatorio,
 * y las que se agreguen a futuro). Al montar la página, el contenido aparece
 * con un fade + leve desplazamiento hacia arriba, en vez de aparecer de golpe.
 *
 * Usa el MISMO timing/curva en todas las páginas a propósito, para que la
 * navegación entre planetas se sienta como una sola transición consistente
 * del sitio — no una distinta por sección. Si agregás un planeta nuevo,
 * envolvé su contenido con este mismo componente en vez de inventar una
 * animación propia.
 *
 * Uso:
 *   export default function MiPlaneta() {
 *     return (
 *       <PlanetEnter>
 *         <div className="min-h-screen bg-white dark:bg-deep">
 *           ...
 *         </div>
 *       </PlanetEnter>
 *     )
 *   }
 *
 * Respeta prefers-reduced-motion (aparece directo, sin animar).
 */
export function PlanetEnter({ children, className = '' }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion) {
      setVisible(true)
      return undefined
    }

    // Doble requestAnimationFrame: asegura que el navegador pinte el
    // estado inicial (oculto) en un frame antes de pasar al visible,
    // para que la transición de CSS realmente se dispare.
    let raf2
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setVisible(true))
    })
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [])

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {children}
    </div>
  )
}
