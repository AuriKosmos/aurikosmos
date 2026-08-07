/**
 * Placeholder de vista previa antes de generar — el "hueco" a la derecha
 * del panel, con look de hoja aún no cargada.
 */
export function EmptyPreview({ children }) {
  return (
    <div className="border-2 border-dashed border-deep/20 py-10 px-6 text-center text-deep/40 flex flex-col items-center gap-2 dark:border-cream/20 dark:text-cream/40">
      <img src="./auri-default.png" alt="" className="w-10 h-10 grayscale opacity-60" aria-hidden="true" />
      <p className="text-sm">{children}</p>
    </div>
  )
}