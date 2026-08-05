// Kit de piezas visuales compartidas por el Laboratorio (generadores).
// Objetivo: que cada generador nuevo (Flashcards, Bingo, Rúbricas...) se
// sienta parte del mismo "universo pixel" sin reescribir el panel desde cero.

/**
 * Panel de opciones con "barra de título" estilo ventana retro.
 * Uso: <PixelPanel title="OPCIONES" icon="🧩">...campos...</PixelPanel>
 */
export function PixelPanel({ title, icon, children, className = '' }) {
  return (
    <div className={`border-2 border-deep shadow-pixel-sm bg-cream no-print ${className}`}>
      <div className="flex items-center gap-2 bg-deep px-3 py-2">
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
          className={`flex-1 px-2 py-2 text-xs font-medium border-2 border-deep transition-colors ${
            value === opt.value ? 'bg-brand text-white' : 'bg-white text-deep hover:bg-sky/20'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/**
 * Botón pixel con sombra escalonada. variant: 'primary' | 'secondary' | 'ghost'
 */
export function PixelButton({ variant = 'primary', className = '', children, ...props }) {
  const styles = {
    primary: 'bg-brand text-white shadow-pixel hover:shadow-pixel-sm',
    secondary: 'bg-white text-deep shadow-pixel-sm hover:shadow-none',
    ghost: 'bg-transparent text-deep border-dashed border-deep/40 hover:border-deep hover:bg-white shadow-none',
  }
  return (
    <button
      className={`w-full px-6 py-3 font-medium border-2 border-deep transition-all hover:translate-x-[2px] hover:translate-y-[2px] ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

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