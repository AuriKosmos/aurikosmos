/**
 * Selector segmentado (ej. tamaño de letra: Pequeña / Mediana / Grande).
 */
export function PixelSegmented({ options, value, onChange }) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 px-2 py-2 text-xs font-medium border-2 border-deep transition-colors dark:border-cream/40 ${
            value === opt.value ? 'bg-brand text-white' : 'bg-white text-deep hover:bg-sky/20 dark:bg-deep dark:text-cream dark:hover:bg-cream/10'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
