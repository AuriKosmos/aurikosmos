/**
 * Ventana emergente estilo pixel, con barra de título como PixelPanel.
 * Uso:
 *   <PixelModal title="CONFIRMAR" icon="⚠️" onClose={() => setOpen(false)}>
 *     <p>¿Seguro que quieres eliminar esto?</p>
 *   </PixelModal>
 *
 * Se cierra al hacer click en el fondo o en la ✕.
 */
export function PixelModal({ title, icon, onClose, children, className = '' }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-deep/60 px-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md border-2 border-deep shadow-pixel bg-cream ${className}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between gap-2 bg-deep px-3 py-2">
          <span className="font-label text-[9px] tracking-widest text-cream/90">
            {icon} {title}
          </span>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-6 h-6 flex items-center justify-center text-cream/70 hover:text-blossom"
          >
            ✕
          </button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
      </div>
    </div>
  )
}
