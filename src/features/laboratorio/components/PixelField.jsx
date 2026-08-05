/**
 * Un "módulo" dentro del panel: agrupa un label + control con separador
 * superior, para que el panel se lea como submenús y no como una lista
 * plana de inputs.
 */
export function PixelField({ label, hint, children }) {
  return (
    <div className="border-t-2 border-deep/10 pt-4 first:border-t-0 first:pt-0">
      {label && (
        <label className="font-label text-[9px] tracking-wide text-deep/70 block mb-2">
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-deep/50 mt-1.5">{hint}</p>}
    </div>
  )
}
