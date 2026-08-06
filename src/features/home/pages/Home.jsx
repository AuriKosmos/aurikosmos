import { useEffect, useRef, useState, useMemo } from 'react'
import { Navbar, Footer, PageContainer } from '../../../components/layout'
import { PixelButton, PixelCard, PixelBadge } from '../../../components/ui'
import { AuriNote } from '../../../components/auri'
import { navbarLinks, navbarMenu, toMissions } from '../../../config/sections.js'

// Los 5 valores (creatividad, cercanía, aprendizaje continuo, tecnología
// útil, diseño bonito) siguen siendo la brújula del proyecto.
const AURI_HERO_LINES = [
  'Mi mochila espacial está llena de ideas... pero necesito un docente explorador para desbloquearlas 🎒',
  'Cada planeta que ves abajo es una herramienta distinta. Solo dos están despiertos por ahora 👀',
  'No hace falta que sepas de tecnología. Solo que quieras probar algo nuevo 🚀',
]

const MISSIONS = toMissions()

const ROADMAP = [
  { emoji: '📚', label: 'Recursos', angle: -90, tier: 1, desc: 'Materiales y guías listas para tus clases.' },
  { emoji: '🎨', label: 'Plantillas', angle: -45, tier: 2, desc: 'Formatos editables para ahorrar tiempo.' },
  { emoji: '🧩', label: 'Generadores', angle: 0, tier: 0, href: '#/laboratorio', desc: 'Crea contenido automático con un clic.' },
  { emoji: '🤖', label: 'IA', angle: 45, tier: 1, href: '#/observatorio', desc: 'Asistente inteligente para docentes.' },
  { emoji: '📝', label: 'Blog', angle: 90, tier: 2, desc: 'Artículos, reflexiones y métodos de enseñanza.' },
  { emoji: '👩‍🏫', label: 'Comunidad', angle: 135, tier: 1, desc: 'Conecta y comparte con otros educadores.' },
  { emoji: '🎮', label: 'Juegos', angle: 180, tier: 0, desc: 'Actividades para aprender jugando en el aula.' },
  { emoji: '💻', label: 'Herramientas', angle: 225, tier: 2, desc: 'Utilidades digitales para el día a día.' },
]

const CX = 410
const CY = 260

const ORBIT_TIERS = [
  { rx: 140, ry: 78, speed: 1.8 },
  { rx: 250, ry: 140, speed: 1.15 },
  { rx: 355, ry: 195, speed: 0.7 },
]

function nodePosition(angleDeg, rx, ry) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: CX + rx * Math.cos(rad),
    y: CY + ry * Math.sin(rad),
  }
}

const BRAND_VARS = {
  '--c-brand': '#7C5CFC',
  '--c-deep': '#1B1E3A',
  '--c-sun': '#FFD166',
  '--c-sky': '#A9D6FF',
  '--c-ember': '#F86611',
  '--c-nova': '#9A6AE7',
  '--c-mint': '#8BCF9B',
  '--c-blossom': '#FFB3C6',
}

const PLANET_PALETTE = [
  'var(--c-sun)', 'var(--c-sky)', 'var(--c-mint)', 'var(--c-blossom)',
  'var(--c-ember)', 'var(--c-nova)', 'var(--c-brand)', 'var(--c-sun)',
]
const PLANET_VARIANTS = ['cratered', 'ringed', 'striped', 'plain']

function seededRandom(seed) {
  const v = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453
  return v - Math.floor(v)
}

const STAR_COUNT = 90
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  x: seededRandom(i * 2.13 + 1) * 100,
  y: seededRandom(i * 3.71 + 7) * 100,
  r: 0.6 + seededRandom(i * 5.31 + 3) * 1.6,
  delay: seededRandom(i * 7.77 + 2) * 3.2,
  dur: 2.2 + seededRandom(i * 9.15 + 4) * 2.6,
}))

const PARTICLE_COUNT = 36
const PARTICLE_COLORS = ['bg-ember', 'bg-nova', 'bg-white']
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  x: seededRandom(i * 4.41 + 11) * 100,
  y: seededRandom(i * 6.19 + 17) * 100,
  size: 4 + seededRandom(i * 8.53 + 5) * 16,
  delay: seededRandom(i * 2.87 + 9) * 2.4,
  color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
}))

function Particles({ count = PARTICLE_COUNT, className = '' }) {
  return (
    <div
      className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {PARTICLES.slice(0, count).map((p, i) => (
        <span
          key={i}
          className={`absolute animate-pulse opacity-90 ${p.color}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: '2.4s',
          }}
        />
      ))}
    </div>
  )
}

function Porthole({ src, alt, size = 'w-56 h-56', ringClassName = 'border-white' }) {
  return (
    <div className={`relative ${size} shrink-0`}>
      <div className={`absolute inset-0 rounded-full border-[6px] ${ringClassName} bg-white shadow-pixel overflow-hidden`}>
        <img src={src} alt={alt} className="pixelated w-full h-full object-contain" />
      </div>
    </div>
  )
}

function Constellation() {
  const [angleOffset, setAngleOffset] = useState(0)
  const [paused, setPaused] = useState(false)
  
  const [activePlanet, setActivePlanet] = useState(null)

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion || paused) return undefined

    let rafId
    let last = performance.now()

    function tick(now) {
      const deltaSeconds = (now - last) / 1000
      last = now
      setAngleOffset((prev) => (prev + 4 * deltaSeconds) % 360)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [paused])

  const PLANET_RADIUS = 34

  // 1. CAPA 1: FONDO ESTRELLADO Y ÓRBITAS
  const backgroundLayer = useMemo(() => (
    <>
      <defs>
        <filter id="kosmos-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        {/* Eliminamos el gradiente del sol viejo */}
      </defs>
      {STARS.map((s, i) => (
        <circle key={`star-${i}`} cx={(s.x / 100) * 820} cy={(s.y / 100) * 620} r={s.r} fill="#FFFFFF">
          <animate attributeName="opacity" values="0.15;0.9;0.15" dur={`${s.dur}s`} begin={`${s.delay}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {ORBIT_TIERS.map((tier, i) => (
        <ellipse key={`orbit-${i}`} cx={CX} cy={CY} rx={tier.rx} ry={tier.ry} fill="none" stroke="var(--c-sky)" strokeWidth="1.5" opacity="0.28" />
      ))}
    </>
  ), [])

  // 2. CAPA 2: EL NUEVO NÚCLEO CENTRAL (Adiós Sol)
  const coreLayer = useMemo(() => (
    <g>
      {/* Halo de luz morada suave */}
      <circle cx={CX} cy={CY} r="95" fill="var(--c-brand)" opacity="0.25" filter="url(#kosmos-glow)" />
      
      {/* Anillos tecnológicos rotando en lugar de rayos */}
      <g opacity="0.7">
        <animateTransform attributeName="transform" type="rotate" from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`} dur="30s" repeatCount="indefinite" />
        <circle cx={CX} cy={CY} r="72" fill="none" stroke="var(--c-nova)" strokeWidth="2" strokeDasharray="12 16" />
        <circle cx={CX} cy={CY} r="62" fill="none" stroke="var(--c-sky)" strokeWidth="1" strokeDasharray="30 10" />
      </g>

      {/* El cuerpo del núcleo (oscuro y pulcro) */}
      <circle cx={CX} cy={CY} r="48" fill="var(--c-deep)" stroke="var(--c-brand)" strokeWidth="4">
        <animate attributeName="r" values="48;51;48" dur="4s" repeatCount="indefinite" />
      </circle>
      
      {/* Auri en el centro */}
      <text x={CX} y={CY + 8} textAnchor="middle" fontSize="26">🐧</text>
      
      <text x={CX} y={CY + 76} textAnchor="middle" fill="#FFFFFF" fontSize="12" fontFamily="'Pixelify Sans', sans-serif" fontWeight="600" letterSpacing="1">
        AURI KOSMOS
      </text>
    </g>
  ), [])

  // 3. MATEMÁTICA 3D Y DATOS
  const planetsData = ROADMAP.map((item, i) => {
    const orbit = ORBIT_TIERS[item.tier]
    const rad = ((item.angle + angleOffset * orbit.speed) * Math.PI) / 180
    
    const x = CX + orbit.rx * Math.cos(rad)
    const y = CY + orbit.ry * Math.sin(rad)
    const depth = Math.sin(rad) 
    
    const baseScale = 1 + (depth * 0.25)
    
    return {
      ...item,
      index: i, x, y, baseScale, depth,
      isBack: depth < 0, 
      color: PLANET_PALETTE[i % PLANET_PALETTE.length],
      variant: PLANET_VARIANTS[i % PLANET_VARIANTS.length],
      isLive: Boolean(item.href)
    }
  })

  const backPlanets = planetsData.filter(p => p.isBack)
  const frontPlanets = planetsData.filter(p => !p.isBack)

  // 4. DIBUJO DE PLANETAS
  const renderPlanet = (p) => {
    const r = PLANET_RADIUS
    const clipId = `planet-clip-${p.index}`
    const isHovered = activePlanet === p.label
    
    const finalScale = isHovered ? p.baseScale * 1.15 : p.baseScale
    const finalOpacity = isHovered ? 1 : (0.65 + (p.depth * 0.35))
    const labelDy = p.isBack ? -48 : 56 

    return (
      <g
        key={p.label}
        transform={`translate(${p.x}, ${p.y})`}
        role={p.isLive ? 'link' : 'presentation'}
        tabIndex={p.isLive ? 0 : undefined}
        onMouseEnter={() => { setActivePlanet(p.label); setPaused(true); }}
        onMouseLeave={() => { setActivePlanet(null); setPaused(false); }}
        onClick={(e) => {
          if (activePlanet !== p.label) {
            e.preventDefault()
            setActivePlanet(p.label)
            setPaused(true)
          } else if (p.isLive) {
            window.location.hash = p.href
          }
        }}
        onKeyDown={p.isLive ? (e) => { if (e.key === 'Enter') window.location.hash = p.href } : undefined}
        style={{ outline: 'none' }}
      >
        <g
          style={{
            transform: `scale(${finalScale})`,
            transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            cursor: p.isLive ? 'pointer' : 'default'
          }}
          opacity={finalOpacity}
        >
          <clipPath id={clipId}>
            <circle cx="0" cy="0" r={r} />
          </clipPath>

          <circle cx="0" cy="0" r={r * 1.25} fill={p.color} opacity="0.45" filter="url(#kosmos-glow)" />

          {p.isLive && (
            <circle cx="0" cy="0" r={r + 6} fill="none" stroke="var(--c-ember)" strokeWidth="2" strokeDasharray="4 4" opacity="0.8" />
          )}

          {p.variant === 'ringed' && (
            <ellipse cx="0" cy="0" rx={r * 1.75} ry={r * 0.5} fill="none" stroke={p.color} strokeWidth="4" opacity="0.6" transform="rotate(-20)" />
          )}

          <circle cx="0" cy="0" r={r} fill={p.color} stroke="var(--c-deep)" strokeWidth="3" />

          <g clipPath={`url(#${clipId})`}>
            {p.variant === 'striped' && (
              <>
                <rect x={-r} y={-r * 0.6} width={r * 2} height={r * 0.42} fill="var(--c-deep)" opacity="0.16" />
                <rect x={-r} y={r * 0.1} width={r * 2} height={r * 0.32} fill="var(--c-deep)" opacity="0.12" />
              </>
            )}
            {p.variant === 'cratered' && (
              <>
                <circle cx={-r * 0.35} cy={-r * 0.28} r={r * 0.22} fill="var(--c-deep)" opacity="0.16" />
                <circle cx={r * 0.32} cy={r * 0.12} r={r * 0.15} fill="var(--c-deep)" opacity="0.16" />
                <circle cx={-r * 0.08} cy={r * 0.42} r={r * 0.12} fill="var(--c-deep)" opacity="0.16" />
              </>
            )}
            <circle cx={r * 0.42} cy={r * 0.42} r={r * 1.05} fill="var(--c-deep)" opacity="0.22" />
            <circle cx={-r * 0.35} cy={-r * 0.35} r={r * 0.5} fill="#FFFFFF" opacity="0.3" />
          </g>

          <circle cx="0" cy="0" r={r * 0.46} fill="#FFFFFF" opacity="0.85" />
          <text x="0" y="7" textAnchor="middle" fontSize="20">{p.emoji}</text>

          <text x="0" y={labelDy} textAnchor="middle" fill="#FFFFFF" fontSize="12" fontFamily="Inter, sans-serif" fontWeight="600">
            {p.label}
          </text>
        </g>

        {isHovered && (
          <foreignObject 
            x="-90" 
            y={p.isBack ? -100 : 85}
            width="180" 
            height="100" 
            className="overflow-visible pointer-events-none"
          >
            <div className="bg-white border-2 border-deep rounded-sm px-3 py-2 shadow-pixel w-full flex items-center justify-center mx-auto box-border">
              <p className="text-deep font-sans text-[12px] leading-snug font-medium text-center m-0">
                {p.desc}
              </p>
            </div>
          </foreignObject>
        )}
      </g>
    )
  }

  return (
    <svg
      viewBox="0 0 820 620"
      className="w-full h-auto max-w-4xl mx-auto"
      style={BRAND_VARS}
      role="img"
      aria-label="Mapa interactivo del ecosistema Auri Kosmos."
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {backgroundLayer}
      {backPlanets.map(renderPlanet)}
      {coreLayer}
      {frontPlanets.map(renderPlanet)}
    </svg>
  )
}

// MEJORA 4: Manipulación directa del DOM para evitar re-renders por cada pixel que se mueva el ratón
function useTilt(maxDeg = 8) {
  const ref = useRef(null)

  function handleMouseMove(e) {
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const rotateY = (px - 0.5) * maxDeg * 2
    const rotateX = (0.5 - py) * maxDeg * 2
    
    // Asignamos el estilo directamente al nodo, bypasseando el motor de React (0 latencia)
    ref.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }

  function handleMouseLeave() {
    if (!ref.current) returnö
    ref.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)'
  }

  return { ref, handleMouseMove, handleMouseLeave }
}

function TiltCard({ children, className = '', liftClassName = '' }) {
  const { ref, handleMouseMove, handleMouseLeave } = useTilt(7)
  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-150 ease-out will-change-transform hover:-translate-y-1 ${liftClassName} ${className}`}
    >
      {children}
    </div>
  )
}

function Reveal({ children, className = '', delayMs = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion) {
      setVisible(true)
      return undefined
    }
    const el = ref.current
    if (!el) return undefined
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${className}`}
      style={{ transitionDelay: visible ? `${delayMs}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}

function MissionCard({ mission }) {
  const locked = !mission.href
  return (
    <TiltCard>
      <PixelCard
        accent={mission.accent}
        className={`flex flex-col h-full ${locked ? 'opacity-60' : 'hover:shadow-pixel'}`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-3xl">{locked ? '🔒' : mission.emoji}</span>
          <PixelBadge variant={locked ? 'neutral' : mission.accent === 'mint' ? 'mint' : 'sky'}>
            {mission.status}
          </PixelBadge>
        </div>
        <h3 className="font-display font-semibold text-deep text-lg mb-1">{mission.title}</h3>
        <p className="text-sm text-deep/70 leading-relaxed mb-4 flex-1">{mission.desc}</p>
        {mission.href ? (
          <PixelButton href={mission.href} variant="secondary">{mission.cta}</PixelButton>
        ) : (
          <p className="font-label text-[9px] tracking-widest text-deep/40">SE ABRE PRÓXIMAMENTE</p>
        )}
      </PixelCard>
    </TiltCard>
  )
}

export default function Home() {
  const [heroLine] = useState(
    () => AURI_HERO_LINES[Math.floor(Math.random() * AURI_HERO_LINES.length)]
  )

  return (
    <div className="min-h-screen bg-white">
      <Navbar links={navbarLinks()} menu={navbarMenu()} />

      <section className="relative overflow-hidden bg-deep bg-kosmos-glow">
        <Particles count={26} />

        <Reveal>
        <PageContainer className="relative z-10 pt-12 pb-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-label text-[10px] tracking-widest text-white mb-5 bg-ember inline-block px-2 py-1 border-2 border-white">
              CONOCÉ A AURI
            </p>
            <h1 className="font-display text-4xl sm:text-5xl leading-[1.15] text-white font-semibold mb-6">
              Estoy explorando nuevas formas de enseñar.
            </h1>
            <p className="text-lg text-white/70 max-w-md mb-6">
              Soy Auri, un pingüino astronauta con una mochila llena de herramientas para docentes.
              Cada planeta del kosmos guarda una forma distinta de crear una clase.
            </p>
            <div className="max-w-md mb-8">
              <AuriNote line={heroLine} />
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="w-48">
                <PixelButton href="#mapa" variant="accent">Ver el mapa</PixelButton>
              </div>
              <div className="w-48">
                <PixelButton href="#misiones" variant="secondary">Misiones disponibles</PixelButton>
              </div>
            </div>
          </div>

          <div className="flex justify-center relative z-10">
            <TiltCard liftClassName="hover:-translate-y-0">
              <Porthole
                src="./auri-hablando.png"
                alt="Auri, el pingüino astronauta mascota de Auri Kosmos, saludando"
                size="w-64 h-64 sm:w-72 sm:h-72"
              />
            </TiltCard>
          </div>
        </PageContainer>
        </Reveal>
      </section>

      <section id="mapa" className="relative overflow-hidden bg-deep bg-kosmos-glow py-24">
        <Particles count={32} />
        <Reveal>
        <PageContainer className="relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-4 text-center sm:text-left">
            <Porthole
              src="./auri-procesando.png"
              alt="Auri pensando, con un globo de diálogo de puntos suspensivos"
              size="w-24 h-24 shrink-0"
              ringClassName="border-nova"
            />
            <div>
              <p className="font-label text-[10px] tracking-widest text-sky mb-5">MAPA DEL KOSMOS</p>
              <h2 className="font-display text-3xl text-white font-semibold max-w-xl">
                No es una tienda. Es un mapa que un docente explora para ahorrar tiempo.
              </h2>
            </div>
          </div>
          <Constellation />
        </PageContainer>
        </Reveal>
      </section>

      <section id="misiones" className="py-20">
        <Reveal>
        <PageContainer>
          <p className="font-label text-[10px] tracking-widest text-nova mb-3 text-center">
            MISIONES DISPONIBLES
          </p>
          <h2 className="font-display text-2xl sm:text-3xl text-deep text-center font-medium mb-10 max-w-2xl mx-auto">
            Dos planetas ya están despiertos. El resto se va a ir abriendo.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MISSIONS.map((m, i) => (
              <Reveal key={m.title} delayMs={i * 90}>
                <MissionCard mission={m} />
              </Reveal>
            ))}
          </div>
        </PageContainer>
        </Reveal>
      </section>

      <section id="meta" className="bg-deep py-20 relative overflow-hidden">
        <Particles count={20} />
        <Reveal>
        <PageContainer size="sm" className="text-center relative z-10">
          <div className="flex justify-center mb-6">
            <Porthole
              src="./auri-celebrando.png"
              alt="Auri festejando con los brazos arriba"
              size="w-28 h-28"
              ringClassName="border-ember"
            />
          </div>
          <p className="font-label text-[10px] tracking-widest text-sky mb-5">PRÓXIMA MISIÓN COLECTIVA</p>
          <h2 className="font-display text-4xl sm:text-5xl text-white font-semibold mb-4">
            30 recursos <span className="text-ember">antes del 30 de septiembre</span>
          </h2>
          <p className="text-white/70">
            No depende de las ventas. Depende solo de nuestra constancia.
          </p>
        </PageContainer>
        </Reveal>
      </section>

      <Footer />
    </div>
  )
}