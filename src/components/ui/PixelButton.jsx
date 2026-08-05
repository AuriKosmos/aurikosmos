/**
 * Botón pixel con sensación táctil física.
 * variant: 'primary' | 'secondary' | 'ghost' | 'accent'
 */
export function PixelButton({ variant = 'primary', href, className = '', children, disabled, ...props }) {
  // Solución: h-full, flex-col y text-center garantizan la misma altura y texto centrado siempre
  const baseStyles = 'relative w-full h-full flex flex-col justify-center items-center text-center px-6 py-3 font-medium border-2 border-deep transition-all duration-150 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-sky/50 disabled:opacity-50 disabled:pointer-events-none'

  // Restauramos tus sombras (shadow-pixel y shadow-pixel-sm) con el movimiento exacto de 2px
  const styles = {
    primary: 'bg-brand text-white shadow-pixel hover:shadow-pixel-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px]',
    secondary: 'bg-white text-deep shadow-pixel-sm hover:shadow-none hover:bg-cream active:translate-x-[2px] active:translate-y-[2px]',
    accent: 'bg-ember text-white shadow-pixel hover:shadow-pixel-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px]',
    ghost: 'bg-transparent text-deep border-dashed border-deep/40 hover:border-solid hover:border-deep hover:bg-white shadow-none active:bg-deep/5',
  }

  const classes = `${baseStyles} ${styles[variant]} ${className}`

  if (href) {
    return (
      <a 
        href={disabled ? undefined : href} 
        className={classes} 
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </a>
    )
  }

  return (
    <button 
      className={classes} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}