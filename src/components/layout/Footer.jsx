import { PageContainer } from './PageContainer.jsx'

// --- Iconos SVG ---
const IconX = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
)

const IconInstagram = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
)

const IconPinterest = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.41 2.967 7.41 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.592 0 12.017 0z"/>
  </svg>
)

const IconTikTok = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

const IconMail = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
)

const IconBrandPlanet = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8"></circle>
    <path d="M19.5 8.5c1.2.8 2.5 2 2.5 3.5 0 2.5-4 4.5-10 4.5S2 14.5 2 12c0-1.5 1.3-2.7 2.5-3.5"></path>
  </svg>
)

/**
 * Footer reutilizable — presente en Home y en todas las páginas de
 * herramientas. Vive en el mismo lenguaje visual que el resto del
 * kosmos (fondo oscuro + estrellas).
 */
const SOCIAL_LINKS = [
  { label: 'X', href: 'https://x.com/AuriKosmos', icon: IconX },
  { label: 'Instagram', href: 'https://instagram.com/aurikosmos', icon: IconInstagram },
  { label: 'Pinterest', href: 'https://pinterest.com/aurikosmos', icon: IconPinterest },
  { label: 'TikTok', href: 'https://tiktok.com/@auri.kosmos', icon: IconTikTok },
]

const EMAIL = 'aurikosmos@gmail.com'

// Mini campo de estrellas
function seededRandom(seed) {
  const v = Math.sin(seed * 91.2228) * 43758.5453
  return v - Math.floor(v)
}

const FOOTER_STARS = Array.from({ length: 30 }, (_, i) => ({
  x: seededRandom(i * 2.13 + 1) * 100,
  y: seededRandom(i * 3.71 + 7) * 100,
  size: 1 + seededRandom(i * 5.31 + 3) * 1.6,
}))

const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'

export function Footer({ className = '' }) {
  return (
    <footer className={`no-print relative overflow-hidden bg-deep ${className}`}>
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {FOOTER_STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white/70"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}px`, height: `${s.size}px` }}
          />
        ))}
      </div>

      <PageContainer className="relative z-10 py-12 flex flex-col items-center gap-6 text-center">
        
        {/* LOGO Y NOMBRE */}
        <div className="flex items-center gap-2">
          <IconBrandPlanet className="w-7 h-7 text-white" aria-hidden="true" />
          <span className="font-display font-semibold text-xl text-white">Auri Kosmos</span>
        </div>

        <p className="text-white/60 text-sm max-w-sm">
          Nos vemos en el próximo planeta 🚀✨
        </p>

        {/* REDES SOCIALES */}
        <nav aria-label="Redes sociales">
          <ul className="flex items-center gap-3">
            {SOCIAL_LINKS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className={`w-10 h-10 flex items-center justify-center text-white bg-white/10 border-2 border-white/30 hover:bg-ember hover:border-white transition-colors ${FOCUS_RING}`}
                >
                  <s.icon className="w-5 h-5" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* EMAIL */}
        <a
          href={`mailto:${EMAIL}`}
          className={`font-label flex items-center gap-2 text-[10px] tracking-wide text-white bg-brand border-2 border-white px-4 py-2 whitespace-nowrap hover:bg-nova transition-colors ${FOCUS_RING}`}
        >
          <IconMail className="w-3.5 h-3.5" aria-hidden="true" />
          {EMAIL}
        </a>

        {/* COPYRIGHT */}
        <p className="text-white/40 text-xs pt-4 border-t border-white/10 w-full">
          © {new Date().getFullYear()} Auri Kosmos — construido desde cero, un día a la vez 💜
        </p>
      </PageContainer>
    </footer>
  )
}