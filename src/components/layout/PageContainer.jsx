/**
 * Caja principal reutilizable. En vez de escribir siempre:
 *   <div className="max-w-6xl mx-auto px-6">
 * escribes:
 *   <PageContainer>...</PageContainer>
 *
 * size: 'sm' (max-w-3xl) | 'md' (max-w-4xl) | 'lg' (max-w-6xl, default)
 */
const SIZES = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
}

export function PageContainer({ size = 'lg', className = '', children, ...props }) {
  return (
    <div className={`${SIZES[size]} mx-auto px-6 ${className}`} {...props}>
      {children}
    </div>
  )
}
