/**
 * Input de texto pixel, con label y hint opcionales (mismo look que ya
 * usas a mano en Crucigramas.jsx, solo que reutilizable).
 * Uso:
 *   <PixelInput label="Título" placeholder="Crucigrama" value={v} onChange={...} />
 *   <PixelInput label="Palabra" error="Muy corta" />
 */
export function PixelInput({ label, hint, error, className = '', ...props }) {
  return (
    <div>
      {label && (
        <label className="font-label text-[9px] tracking-wide text-deep/70 dark:text-cream/70 block mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full border-2 p-2.5 font-body text-sm text-deep bg-white focus:outline-none transition-colors dark:bg-deep dark:text-cream ${
          error ? 'border-blossom focus:border-blossom' : 'border-deep focus:border-brand dark:border-cream/40'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-blossom mt-1.5">{error}</p>}
      {!error && hint && <p className="text-xs text-deep/50 dark:text-cream/50 mt-1.5">{hint}</p>}
    </div>
  )
}
