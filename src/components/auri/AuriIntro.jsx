import { useEffect, useRef, useState } from 'react'

const SIGNAL_LINE = 'TRANSMISIÓN ENTRANTE...'

const AURI_LINES = [
  'Hola, humano 👋',
  'Soy Auri. Estoy explorando nuevas formas de enseñar,',
  'y necesito un docente que quiera crear mundos conmigo.',
]

function seededRandom(seed) {
  const v = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453
  return v - Math.floor(v)
}

const STARS = Array.from({ length: 90 }, (_, i) => {
  const angle = seededRandom(i * 4.21 + 5) * Math.PI * 2
  const startDist = seededRandom(i * 2.13 + 1) * 15
  return {
    angle,
    startDist,
    size: 1 + seededRandom(i * 5.31 + 3) * 2,
    duration: 2.5 + seededRandom(i * 9.13 + 4) * 3.5,
    delay: seededRandom(i * 7.77 + 2) * 6,
  }
})
function useTypewriter(text, { active, speed = 28 }) {
  const [shown, setShown] = useState('')
  useEffect(() => {
    if (!active) return undefined
    setShown('')
    let i = 0
    const id = setInterval(() => {
      i += 1
      setShown(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, active, speed])
  return shown
}

export function AuriIntro({ onEnter }) {
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  ).current

  // stage: 'signal' -> 'loading' -> 'dialogue' -> 'ready'
  const [stage, setStage] = useState(reducedMotion ? 'ready' : 'signal')
  const [progress, setProgress] = useState(reducedMotion ? 100 : 0)
  const [lineIndex, setLineIndex] = useState(0)

  const signalText = useTypewriter(SIGNAL_LINE, { active: stage === 'signal' })

  // signal -> loading
  useEffect(() => {
    if (stage !== 'signal' || reducedMotion) return undefined
    if (signalText !== SIGNAL_LINE) return undefined
    const t = setTimeout(() => setStage('loading'), 300)
    return () => clearTimeout(t)
  }, [stage, signalText, reducedMotion])

  // loading bar
  useEffect(() => {
    if (stage !== 'loading') return undefined
    let raf
    let value = 0
    const step = () => {
      value += 3 + Math.random() * 4
      setProgress(Math.min(value, 100))
      if (value < 100) raf = requestAnimationFrame(step)
      else setTimeout(() => setStage('dialogue'), 250)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [stage])

  const currentLine = useTypewriter(AURI_LINES[lineIndex] || '', {
    active: stage === 'dialogue',
    speed: 20,
  })

  useEffect(() => {
    if (stage !== 'dialogue') return undefined
    if (currentLine !== AURI_LINES[lineIndex]) return undefined
    if (lineIndex >= AURI_LINES.length - 1) {
      const t = setTimeout(() => setStage('ready'), 400)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setLineIndex((i) => i + 1), 500)
    return () => clearTimeout(t)
  }, [stage, currentLine, lineIndex])

  return (
    <div className="fixed inset-0 z-50 bg-deep text-white overflow-hidden flex flex-col items-center justify-center px-6">
     <div className="absolute inset-0" aria-hidden="true">
  {STARS.map((s, i) => {
    const tx = Math.cos(s.angle)
    const ty = Math.sin(s.angle)
    return (
      <span
        key={i}
        className="absolute left-1/2 top-1/2 rounded-full bg-white"
        style={{
          width: `${s.size}px`,
          height: `${s.size}px`,
          animation: reducedMotion
            ? undefined
            : `warpFly ${s.duration}s linear infinite`,
          animationDelay: `${s.delay}s`,
          opacity: reducedMotion ? 0.7 : 0,
          '--tx-start': `${tx * s.startDist}vw`,
          '--ty-start': `${ty * s.startDist}vh`,
          '--tx-end': `${tx * 70}vw`,
          '--ty-end': `${ty * 70}vh`,
        }}
      />
    )
  })}
</div>

      <button
        type="button"
        onClick={onEnter}
        className="absolute top-5 right-5 z-10 font-label text-[9px] tracking-widest text-white/50 border-2 border-white/30 px-3 py-1.5 hover:text-white hover:border-white transition-colors"
      >
        SALTAR ⏭
      </button>

      <div className="relative z-10 max-w-md w-full text-center">
        {(stage === 'signal' || stage === 'loading') && (
          <>
            <p className="font-label text-xs sm:text-sm tracking-widest text-sky mb-8 min-h-[1.5em]">
              {reducedMotion ? SIGNAL_LINE : signalText}
              {stage === 'signal' && <span className="animate-pulse">▮</span>}
            </p>
            {stage === 'loading' && (
              <div className="w-full">
                <div className="h-4 border-2 border-white/40 bg-white/5">
                  <div
                    className="h-full bg-nova transition-[width] duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="font-label text-[10px] text-white/60 mt-3">
                  {Math.floor(progress)}%
                </p>
              </div>
            )}
          </>
        )}

        {(stage === 'dialogue' || stage === 'ready') && (
          <div className="text-left bg-white/5 border-2 border-white/20 p-5 mb-8">
            <div className="flex items-start gap-3">
             <img
  src="./public/auri-hablando.gif"
  alt=""
  aria-hidden="true"
  className="w-20 h-20 shrink-0 object-contain -mt-2"
/>
              <p className="text-base sm:text-lg leading-relaxed min-h-[4.5em]">
                {reducedMotion
                  ? AURI_LINES.join(' ')
                  : AURI_LINES.slice(0, lineIndex).join(' ') +
                    (AURI_LINES.slice(0, lineIndex).length ? ' ' : '') +
                    currentLine}
              </p>
            </div>
          </div>
        )}

        {stage === 'ready' && (
          <button
            type="button"
            onClick={onEnter}
            className="font-label text-xs tracking-widest bg-ember text-white border-2 border-white px-8 py-4 shadow-pixel hover:shadow-pixel-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all animate-[fadeIn_0.4s_ease]"
          >
            ENTRAR AL KOSMOS 🚀
          </button>
        )}
      </div>
    </div>
  )
}

export const AURI_INTRO_SESSION_KEY = 'auri-kosmos:intro-seen'
