/**
 * Etiqueta pequeña estilo pixel. Uso:
 *   <PixelBadge variant="mint">Disponible</PixelBadge>
 *   <PixelBadge variant="brand">Beta</PixelBadge>
 *
 * variant: 'brand' | 'mint' | 'sun' | 'blossom' | 'sky' | 'neutral'
 */
const VARIANTS = {
  brand: 'bg-brand text-white',
  mint: 'bg-mint text-deep',
  sun: 'bg-sun text-deep',
  blossom: 'bg-blossom text-deep',
  sky: 'bg-sky text-deep',
  neutral: 'bg-cream text-deep dark:bg-deep dark:text-cream',
}

export function PixelBadge({ variant = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-block font-label text-[8px] tracking-widest uppercase border-2 border-deep dark:border-cream/40 px-2 py-1 ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
