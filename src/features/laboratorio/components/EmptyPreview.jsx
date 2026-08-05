/**
 * Placeholder de vista previa antes de generar — el "hueco" a la derecha
 * del panel, con look de hoja aún no cargada.
 */
export function EmptyPreview({ children }) {
  return (
    <div className="border-2 border-dashed border-deep/20 p-16 text-center text-deep/40 flex flex-col items-center gap-3">
      <span className="text-3xl grayscale opacity-60" aria-hidden="true">🐧</span>
      <p>{children}</p>
    </div>
  )
}
