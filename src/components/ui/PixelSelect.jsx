/**
 * Select pixel. Uso:
 *   <PixelSelect
 *     label="Materia"
 *     value={v}
 *     onChange={(e) => setV(e.target.value)}
 *     options={[{ value: 'mate', label: 'Matemáticas' }]}
 *     placeholder="Elige una opción"
 *   />
 */
export function PixelSelect({ label, value, onChange, options = [], placeholder, className = '' }) {
  return (
    <div>
      {label && (
        <label className="font-label text-[9px] tracking-wide text-deep/70 dark:text-cream/70 block mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className={`w-full appearance-none border-2 border-deep p-2.5 pr-9 font-body text-sm text-deep bg-white focus:outline-none focus:border-brand dark:bg-deep dark:text-cream dark:border-cream/40 ${className}`}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-deep/60 dark:text-cream/60 text-xs"
          aria-hidden="true"
        >
          ▼
        </span>
      </div>
    </div>
  )
}
