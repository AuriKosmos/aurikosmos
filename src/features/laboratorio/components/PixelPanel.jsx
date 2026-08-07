/**
 * Panel de opciones con "barra de título" estilo ventana retro.
 * Uso: <PixelPanel title="OPCIONES" icon="🧩">...campos...</PixelPanel>
 */
export function PixelPanel({ title, icon, children, className = '' }) {
  return (
    <div className={`border-2 border-deep shadow-pixel-sm bg-cream no-print dark:bg-deep dark:border-cream/30 dark:shadow-none ${className}`}>
      <div className="flex items-center gap-2 bg-deep px-3 py-2 dark:bg-black/30">
        <span className="flex gap-1" aria-hidden="true">
          <span className="w-2 h-2 bg-blossom" />
          <span className="w-2 h-2 bg-sun" />
          <span className="w-2 h-2 bg-mint" />
        </span>
        <span className="font-label text-[9px] tracking-widest text-cream/90 ml-1">
          {icon} {title}
        </span>
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </div>
  )
}
