/**
 * Checkbox pixel: casilla cuadrada de 2 tonos (blanco / brand) con un
 * check dibujado en SVG, en vez del checkbox nativo del navegador.
 */
export function PixelCheckbox({ checked, onChange, children }) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-deep cursor-pointer select-none group">
      <span className="relative inline-flex w-5 h-5 border-2 border-deep bg-white shrink-0 group-hover:border-brand transition-colors">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        {checked && (
          <span className="absolute inset-0 flex items-center justify-center bg-brand" aria-hidden="true">
            <svg viewBox="0 0 10 10" className="w-3 h-3" fill="none">
              <path d="M2 5 L4.2 7.2 L8 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="square" />
            </svg>
          </span>
        )}
      </span>
      {children}
    </label>
  )
}
