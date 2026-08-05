/**
 * Encabezado de página/sección: eyebrow (etiqueta pequeña arriba) + título
 * grande + descripción opcional. Es el patrón que ya usas a mano en
 * Crucigramas.jsx ("🧩 GENERADOR" / "Crucigrama" / texto) y en varias
 * secciones de Home.
 *
 * Uso:
 *   <PlanetHeader
 *     eyebrow="🧩 GENERADOR"
 *     title="Crucigrama"
 *     description="Una fila por palabra: la palabra a la izquierda, su pista a la derecha."
 *   />
 *
 * align: 'center' (default) | 'left'
 */
export function PlanetHeader({ eyebrow, title, description, align = 'center', className = '' }) {
  const alignClass = align === 'left' ? 'text-left' : 'text-center mx-auto'

  return (
    <div className={`no-print mb-10 ${alignClass} ${className}`}>
      {eyebrow && (
        <p className="font-label text-[10px] tracking-widest text-brand mb-4">{eyebrow}</p>
      )}
      {title && (
        <h1 className="font-display text-4xl text-deep font-semibold mb-3">{title}</h1>
      )}
      {description && (
        <p className={`text-deep/70 ${align === 'center' ? 'max-w-md mx-auto' : 'max-w-md'}`}>
          {description}
        </p>
      )}
    </div>
  )
}
