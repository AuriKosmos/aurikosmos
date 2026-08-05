/**
 * Tarjeta base reutilizable. Uso:
 *   <PixelCard>...</PixelCard>
 *   <PixelCard accent="brand">...</PixelCard>   ← borde superior de color
 *
 * accent: 'brand' | 'sun' | 'mint' | 'blossom' | 'sky' | 'ember' | 'nova' | null
 */
const ACCENTS = {
  brand: 'border-t-4 border-t-brand',
  sun: 'border-t-4 border-t-sun',
  mint: 'border-t-4 border-t-mint',
  blossom: 'border-t-4 border-t-blossom',
  sky: 'border-t-4 border-t-sky',
  ember: 'border-t-4 border-t-ember',
  nova: 'border-t-4 border-t-nova',
}

export function PixelCard({ accent = null, children, className = '', ...props }) {
  return (
    <div
      className={`bg-white border-2 border-deep shadow-pixel-sm p-5 ${accent ? ACCENTS[accent] : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}