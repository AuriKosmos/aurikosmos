import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { PageContainer } from './PageContainer.jsx'

// ============================================================================
// ICONOS VECTORIALES (SVG)
// ============================================================================

export const IconBrandPlanet = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8"></circle>
    <path d="M19.5 8.5c1.2.8 2.5 2 2.5 3.5 0 2.5-4 4.5-10 4.5S2 14.5 2 12c0-1.5 1.3-2.7 2.5-3.5"></path>
  </svg>
)

export const IconMenu = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
)

export const IconArrowLeft = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"></path>
    <path d="M19 12H5"></path>
  </svg>
)

export const IconClose = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

export const IconChevronDown = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
)

// Iconos para las categorías principales
export const IconMoon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
  </svg>
)

export const IconFlask = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2v7.31L2.07 19.23A2 2 0 0 0 3.73 22h16.54a2 2 0 0 0 1.66-2.77L14 9.31V2"></path>
    <path d="M8.5 2h7"></path>
    <path d="M14 9.31 16.5 14h-9l2.5-4.69"></path>
  </svg>
)

export const IconBook = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
  </svg>
)

// Iconos para las subcategorías
export const IconLetters = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7 20 5-16 5 16"></path>
    <path d="M8 12h8"></path>
  </svg>
)

export const IconPencil = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
)

export const IconBricks = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
    <path d="M10 4v16"></path>
    <path d="M2 12h8"></path>
    <path d="M10 12h12"></path>
  </svg>
)

export const IconUsers = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
)

function RenderIcon({ icon: Icon, className }) {
  if (!Icon) return null
  if (typeof Icon === 'string') return <span className="text-sm">{Icon}</span> 
  return <Icon className={className} aria-hidden="true" />
}

// ============================================================================
// LÓGICA DEL NAVBAR Y MENÚ LATERAL
// ============================================================================

const HIDE_THRESHOLD = 12

function useHideOnScrollDown() {
  const [visible, setVisible] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const lastY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    lastY.current = window.scrollY

    function handleScroll() {
      if (ticking.current) return
      ticking.current = true

      requestAnimationFrame(() => {
        const currentY = window.scrollY
        const delta = currentY - lastY.current

        setScrolled(currentY > 10)

        if (currentY < 10) {
          setVisible(true)
        } else if (delta > HIDE_THRESHOLD) {
          setVisible(false)
        } else if (delta < -2) {
          setVisible(true)
        }

        lastY.current = currentY
        ticking.current = false
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return { visible, scrolled }
}

function DrawerMenu({ items }) {
  const [open, setOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState({})

  // Bloquear el scroll del body cuando el menú está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('keydown', onKey)
    }
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const toggleGroup = (groupLabel) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupLabel]: !prev[groupLabel]
    }))
  }

  // Extraemos el contenido del Drawer para el Portal
  const drawerContent = (
    <>
      {/* Overlay oscuro */}
      {open && (
        <div
          className="fixed inset-0 bg-deep/40 backdrop-blur-sm z-[100] transition-opacity"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Panel lateral (Drawer) - h-[100dvh] para móviles */}
      <div
        className={`fixed top-0 right-0 h-[100dvh] w-[85vw] max-w-sm bg-white border-l-2 border-deep shadow-pixel z-[101] transform transition-transform duration-300 ease-in-out flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal"
      >
        {/* Cabecera del Drawer */}
        <div className="flex items-center justify-between p-4 border-b-2 border-deep bg-cream shrink-0">
          <span className="font-display font-semibold text-lg text-deep flex items-center gap-2">
            <IconBrandPlanet className="w-5 h-5" /> Explorar
          </span>
          <button
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-sky/30 border-2 border-transparent hover:border-deep transition-colors"
            aria-label="Cerrar menú"
          >
            <IconClose className="w-5 h-5 text-deep" />
          </button>
        </div>

        {/* Contenido scrollable del Drawer */}
        <div className="flex-1 overflow-y-auto py-2">
          {items.map((group) => {
            const hasChildren = group.children && group.children.length > 0
            const isExpanded = expandedGroups[group.label]

            return (
              <div key={group.label} className="border-b border-deep/10 last:border-0">
                {/* Categoría Principal */}
                {group.comingSoon ? (
                  <div className="flex items-center justify-between px-6 py-4 text-deep/40">
                    <span className="flex items-center gap-3 font-semibold text-base">
                      <RenderIcon icon={group.icon} className="w-5 h-5" />
                      {group.label}
                    </span>
                    <span className="font-label text-[8px] tracking-widest bg-deep/5 px-2 py-1 rounded">PRÓXIMAMENTE</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (hasChildren) {
                        toggleGroup(group.label)
                      } else if (group.href) {
                        window.location.href = group.href
                        setOpen(false)
                      }
                    }}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-cream transition-colors text-left"
                    aria-expanded={hasChildren ? isExpanded : undefined}
                  >
                    <span className="flex items-center gap-3 font-semibold text-base text-deep">
                      <RenderIcon icon={group.icon} className="w-5 h-5" />
                      {group.label}
                    </span>
                    {hasChildren && (
                      <IconChevronDown
                        className={`w-5 h-5 text-deep transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>
                )}

                {/* Sub-elementos (Acordeón) */}
                {hasChildren && isExpanded && !group.comingSoon && (
                  <div className="bg-cream/30 pb-3 pt-1 px-4">
                    <div className="flex flex-col gap-1 border-l-2 border-deep/20 ml-5 pl-4">
                      {group.children.map((child) => (
                        <a
                          key={child.label}
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 py-2.5 px-2 text-sm text-deep/80 hover:text-deep hover:bg-cream font-medium transition-colors rounded-sm"
                        >
                          <RenderIcon icon={child.icon} className="w-4 h-4 opacity-70" />
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Botón para abrir el menú que se mantiene en la jerarquía del DOM original */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="font-label text-[10px] tracking-wide text-deep bg-white border-2 border-deep px-3 py-1.5 hover:bg-sky/30 transition-colors flex items-center gap-1.5"
      >
        <IconMenu className="w-4 h-4" />
        MENÚ
      </button>

      {/* Renderizar el portal al final del body */}
      {typeof document !== 'undefined' && createPortal(drawerContent, document.body)}
    </>
  )
}

export function Navbar({ backHref, backLabel = 'VOLVER', menu, badge, className = '' }) {
  const { visible, scrolled } = useHideOnScrollDown()

  return (
    <header
      className={[
        'no-print sticky top-0 z-40', // z-40 para que quede por debajo del z-100 del Drawer
        'transition-[transform,background-color,box-shadow] duration-300 ease-out',
        visible ? 'translate-y-0' : '-translate-y-full',
        scrolled ? 'bg-white/90 backdrop-blur-sm shadow-[0_2px_0_0_rgba(0,0,0,0.08)]' : 'bg-transparent',
        className,
      ].join(' ')}
    >
      <PageContainer className="py-6 flex items-center justify-between">
        
        {/* LOGO */}
        <a href="#/" className="flex items-center gap-2 group">
          <img
            src="./auri-cara.png"
            alt=""
            aria-hidden="true"
            className="w-7 h-7 group-hover:rotate-12 transition-transform"
          />
          <span className="font-display font-semibold text-xl text-deep">Auri Kosmos</span>
        </a>

        {/* ACCIONES (Volver y Menú Lateral) */}
        <div className="flex items-center gap-3">
          
          {backHref && (
            <a
              href={backHref}
              className="font-label flex items-center gap-1.5 text-[10px] tracking-wide text-deep bg-cream border-2 border-deep px-3 py-1.5 hover:bg-sky/30 transition-colors"
            >
              <IconArrowLeft className="w-3.5 h-3.5" />
              {backLabel}
            </a>
          )}

          {/* NUEVO MENÚ LATERAL */}
          {menu && menu.length > 0 && <DrawerMenu items={menu} />}

          {badge && (
            <span className="hidden sm:inline-flex items-center font-label text-[10px] tracking-wide text-deep/50 bg-cream border-2 border-deep px-3 py-1.5">
              {badge}
            </span>
          )}
        </div>
      </PageContainer>
    </header>
  )
}