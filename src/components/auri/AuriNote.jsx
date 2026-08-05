/**
 * Burbuja de Auri con una línea corta. Se usa después de generar,
 * o para avisos suaves (nunca errores duros — esos van aparte).
 */
export function AuriNote({ line }) {
  if (!line) return null
  return (
    <div className="flex items-start gap-2 bg-white border-2 border-deep/20 p-3">
      <span className="text-xl shrink-0" aria-hidden="true">🐧</span>
      <p className="text-sm text-deep/70 italic">{line}</p>
    </div>
  )
}
