import { useEffect } from 'react'

/**
 * Notificación flotante, esquina inferior derecha.
 * Uso:
 *   <PixelToast message="¡Recurso descargado!" variant="mint" onClose={() => setShow(false)} />
 *   <PixelToast message="Guardado" variant="brand" duration={3000} onClose={() => setShow(false)} />
 *
 * variant: 'brand' | 'mint' | 'sun' | 'blossom'
 * duration: si se pasa, se auto-cierra sola después de X ms.
 */
const VARIANTS = {
  brand: 'border-l-brand',
  mint: 'border-l-mint',
  sun: 'border-l-sun',
  blossom: 'border-l-blossom',
}

export function PixelToast({ message, variant = 'brand', onClose, duration }) {
  useEffect(() => {
    if (!duration) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white border-2 border-deep border-l-8 shadow-pixel px-4 py-3 max-w-xs ${VARIANTS[variant]}`}
    >
      <img src="./auri-cara.png" alt="" className="w-7 h-7 shrink-0 object-contain" aria-hidden="true" />
      <p className="text-sm text-deep flex-1">{message}</p>
      <button
        onClick={onClose}
        aria-label="Cerrar notificación"
        className="text-deep/40 hover:text-deep shrink-0"
      >
        ✕
      </button>
    </div>
  )
}
