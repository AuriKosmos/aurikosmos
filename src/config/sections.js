/**
 * Fuente única de verdad para las secciones ("planetas") de Auri Kosmos.
 *
 * Antes esta misma lista de 4 planetas estaba escrita a mano en 3 lugares
 * distintos dentro de Home.jsx: el array MISSIONS (tarjetas), el prop
 * `links` del Navbar (botones rápidos) y el prop `menu` del Navbar (☰).
 * Agregar o abrir un planeta nuevo significaba acordarse de tocar los 3 —
 * y era fácil que se desincronizaran (por ejemplo, un planeta visible en
 * el menú pero ausente en las misiones, o con un ícono distinto en cada
 * lado).
 *
 * Ahora hay UNA sola entrada por planeta acá. Cuando se abra "Biblioteca",
 * por ejemplo, alcanza con:
 *   1. status: 'sealed' -> 'live'
 *   2. agregar href y (si aplica) tools
 * y automáticamente aparece bien en el menú, en los links rápidos y en
 * las tarjetas de misiones del Home — sin tocar Home.jsx ni Navbar.jsx.
 *
 * status:
 *   'live'      -> el planeta ya se puede visitar (necesita href)
 *   'prototype' -> visitable, pero marcado como prueba/prototipo
 *   'sealed'    -> todavía no existe (aparece como "próximamente")
 *
 * navVariant: color del botón rápido en el Navbar cuando status !== 'sealed'.
 *   'brand' (fondo morado, planetas "de día") | 'deep' (fondo oscuro, planetas "nocturnos")
 *
 * accent: color de la tarjeta de misión en el Home (ver PixelCard/PixelBadge).
 *
 * tools: sub-herramientas del planeta (por ejemplo, dentro de Laboratorio
 * están Sopa de letras y Crucigramas). Alimentan los hijos del menú ☰.
 */
export const SECTIONS = [
  {
    id: 'laboratorio',
    label: 'Laboratorio',
    icon: '🧩',
    href: '#/laboratorio',
    status: 'live',
    navVariant: 'brand',
    accent: 'mint',
    description: 'Generadores de sopas de letras y crucigramas, listos para imprimir.',
    cta: 'Entrar a la misión',
    tools: [
      { label: 'Sopa de letras', href: '#/laboratorio/sopa-de-letras', icon: '🔤' },
      { label: 'Crucigramas', href: '#/laboratorio/crucigramas', icon: '✏️' },
    ],
  },
  {
    id: 'observatorio',
    label: 'Observatorio',
    icon: '🌙',
    href: '#/observatorio',
    status: 'prototype',
    navVariant: 'deep',
    accent: 'nova',
    description: 'Dos prototipos de IA para armar tu clase — sugerencias simuladas, marcadas como tal.',
    cta: 'Ver prototipos',
    tools: [
      { label: 'Construye mi clase', href: '#/observatorio/construye-mi-clase', icon: '🧱' },
    ],
  },
  {
    id: 'biblioteca',
    label: 'Biblioteca',
    icon: '📚',
    href: null,
    status: 'sealed',
    accent: null,
    description: 'Recursos descargables organizados por materia y nivel.',
    tools: [],
  },
  {
    id: 'comunidad',
    label: 'Comunidad',
    icon: '👩‍🏫',
    href: null,
    status: 'sealed',
    accent: null,
    description: 'Un lugar para compartir lo que creaste con otros docentes.',
    tools: [],
  },
]

const STATUS_LABEL = {
  live: 'DISPONIBLE',
  prototype: 'PROTOTIPO',
  sealed: 'SELLADO',
}

/**
 * Botones rápidos del Navbar (los que hoy ves como "OBSERVATORIO" / "LABORATORIO").
 * El de variant 'brand' (el resaltado en morado) siempre queda último, a la
 * derecha, como CTA principal — es una decisión de diseño explícita, no un
 * accidente del orden en que están escritas las secciones arriba.
 */
export function navbarLinks(sections = SECTIONS) {
  return sections
    .filter((s) => s.status !== 'sealed')
    .map((s) => ({
      href: s.href,
      label: s.label.toUpperCase(),
      icon: s.icon,
      variant: s.navVariant,
    }))
    .sort((a, b) => (a.variant === 'brand' ? 1 : 0) - (b.variant === 'brand' ? 1 : 0))
}

/** Estructura del menú ☰ del Navbar, con sub-herramientas como hijos. */
export function navbarMenu(sections = SECTIONS) {
  return sections.map((s) =>
    s.status === 'sealed'
      ? { label: s.label, icon: s.icon, comingSoon: true }
      : { label: s.label, href: s.href, icon: s.icon, children: s.tools }
  )
}

/** Tarjetas de "Misiones disponibles" del Home. */
export function toMissions(sections = SECTIONS) {
  return sections.map((s) => ({
    emoji: s.icon,
    title: s.label,
    desc: s.description,
    status: STATUS_LABEL[s.status],
    accent: s.accent,
    href: s.href,
    cta: s.cta,
  }))
}
