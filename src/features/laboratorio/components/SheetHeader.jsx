/**
 * Encabezado de la hoja imprimible: título + campos de Nombre/Curso/Fecha.
 * Compartido por todos los generadores para que las hojas se vean como
 * una misma "familia" de material, sin importar cuál las generó.
 */
export function SheetHeader({ title, badge, showName, showCourse, showDate, extraLabel }) {
  const hasFields = showName || showCourse || showDate || extraLabel
  return (
    <div className="mb-6 pb-4 border-b-2 border-deep">
      {title && (
        <h2 className="font-display text-2xl text-deep font-semibold text-center mb-4">
          {title}
          {badge && <span className="text-brand text-sm ml-2">{badge}</span>}
        </h2>
      )}
      {hasFields && (
        <div className="flex flex-wrap gap-x-8 gap-y-3 justify-center text-sm text-deep">
          {showName && (
            <span>
              Nombre: <span className="inline-block border-b border-deep w-40">&nbsp;</span>
            </span>
          )}
          {showCourse && (
            <span>
              Curso: <span className="inline-block border-b border-deep w-28">&nbsp;</span>
            </span>
          )}
          {showDate && (
            <span>
              Fecha: <span className="inline-block border-b border-deep w-28">&nbsp;</span>
            </span>
          )}
          {extraLabel && (
            <span>
              {extraLabel}: <span className="inline-block border-b border-deep w-28">&nbsp;</span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
