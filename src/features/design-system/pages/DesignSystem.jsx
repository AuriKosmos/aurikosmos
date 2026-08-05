/**
 * DesignSystem.jsx
 * ─────────────────────────────────────────────────────────────
 * Página interna (NO es para usuarios finales) que muestra TODO lo
 * que existe hoy en el Design System de Auri Kosmos.
 *
 * Guárdala en: src/features/design-system/pages/DesignSystem.jsx
 *
 * Enrútala en App.jsx (o router.jsx), junto a las demás:
 *   if (route.startsWith('#/design-system')) return <DesignSystem />
 *
 * Requiere:
 *   - src/components/ui/         (PixelButton, PixelBadge, PixelCard...)
 *   - src/components/auri/       (AuriNote)
 *   - src/features/laboratorio/components/  (PixelPanel, PixelField, SheetHeader, EmptyPreview)
 *
 * Nota: esta página importa componentes de la feature "laboratorio" aunque
 * ella misma es de la feature "design-system". Eso normalmente se evita
 * (features no deberían importarse entre sí), pero aquí es intencional:
 * design-system es una página de referencia interna, su único trabajo es
 * mostrar lo que existe en otras partes del proyecto.
 * ─────────────────────────────────────────────────────────────
 */

import { useState } from 'react'
import {
  PixelButton,
  PixelCheckbox,
  PixelSegmented,
  PixelBadge,
  PixelCard,
  PixelInput,
  PixelSelect,
  PixelTabs,
  PixelModal,
  PixelToast,
} from '../../../components/ui'
import { AuriNote } from '../../../components/auri'
import { PixelPanel, PixelField, SheetHeader, EmptyPreview } from '../../laboratorio/components'

// Colores reales — tailwind.config.js (Brand Book v1.0)
const COLOR_TOKENS = [
  { name: 'deep', hex: '#1B1E3A', usage: 'Texto principal, contornos pixel' },
  { name: 'brand', hex: '#7C5CFC', usage: 'Acentos, CTA' },
  { name: 'sky', hex: '#A9D6FF', usage: 'Fondos suaves (NO usar para texto)' },
  { name: 'mint', hex: '#8BCF9B', usage: 'Highlights positivos' },
  { name: 'sun', hex: '#FFD166', usage: 'Estrellas, detalles' },
  { name: 'blossom', hex: '#FFB3C6', usage: 'Acentos suaves / "peligro" temporal' },
  { name: 'cream', hex: '#FBF3EF', usage: 'Fondo cálido alternativo' },
]

const SEGMENTED_OPTIONS = [
  { value: 'sm', label: 'Pequeña' },
  { value: 'md', label: 'Mediana' },
  { value: 'lg', label: 'Grande' },
]

const SELECT_OPTIONS = [
  { value: 'mate', label: 'Matemáticas' },
  { value: 'lenguaje', label: 'Lenguaje' },
  { value: 'ciencias', label: 'Ciencias' },
]

const TABS = [
  { value: 'recursos', label: 'Recursos' },
  { value: 'favoritos', label: 'Favoritos' },
  { value: 'colecciones', label: 'Colecciones' },
]

function Section({ title, description, children, className = '' }) {
  return (
    <section className="mb-16 border-b-2 border-deep/10 pb-12">
      <h2 className="font-display text-2xl text-deep font-semibold mb-1">{title}</h2>
      {description && <p className="text-deep/60 mb-6 max-w-2xl">{description}</p>}
      <div className={`flex flex-wrap gap-4 items-start ${className}`}>{children}</div>
    </section>
  )
}

function Swatch({ name, hex, usage }) {
  return (
    <div className="w-44">
      <div className="h-20 border-2 border-deep shadow-pixel-sm mb-2" style={{ backgroundColor: hex }} />
      <p className="text-deep font-semibold text-sm">{name}</p>
      <p className="text-deep/50 text-xs">{hex}</p>
      <p className="text-deep/40 text-xs mt-1">{usage}</p>
    </div>
  )
}

export default function DesignSystem() {
  const [checked, setChecked] = useState(true)
  const [segmented, setSegmented] = useState('md')
  const [selectValue, setSelectValue] = useState('mate')
  const [tab, setTab] = useState('recursos')
  const [modalOpen, setModalOpen] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <a href="#/" className="flex items-center gap-2">
          <span className="text-2xl">🐧</span>
          <span className="font-display font-semibold text-xl text-deep">Auri Kosmos</span>
        </a>
        <span className="font-label text-[10px] tracking-wide text-deep/50 bg-cream border-2 border-deep px-3 py-1.5">
          Design System interno
        </span>
      </header>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="mb-14">
          <p className="font-label text-[10px] tracking-widest text-brand mb-4">🧩 REFERENCIA</p>
          <h1 className="font-display text-4xl text-deep font-semibold mb-3">Design System</h1>
          <p className="text-deep/70 max-w-lg">
            Todo lo que hoy existe de verdad en <code>components/ui</code>,{' '}
            <code>components/auri</code> y <code>components/laboratorio</code>. Si algo cambia
            ahí, cámbialo aquí también.
          </p>
        </div>

        {/* COLORES */}
        <Section title="🎨 Colores" description="tailwind.config.js — Brand Book v1.0">
          {COLOR_TOKENS.map((c) => (
            <Swatch key={c.name} {...c} />
          ))}
        </Section>

        {/* TIPOGRAFÍA */}
        <Section title="🔤 Tipografía">
          <div className="space-y-4 w-full">
            <p className="font-display text-4xl text-deep font-semibold">Pixelify Sans — Heading</p>
            <p className="font-label text-xs tracking-widest text-deep">PRESS START 2P — LABEL / PIXEL</p>
            <p className="font-body text-base text-deep/80">
              Inter — texto de párrafo normal, usado para descripciones y contenido general.
            </p>
          </div>
        </Section>

        {/* ============ components/ui ============ */}
        <p className="font-label text-[9px] tracking-widest text-brand/70 mb-6">📦 COMPONENTS/UI</p>

        <Section
          title="🟦 PixelButton"
          description="variant: 'primary' | 'secondary' | 'ghost'"
        >
          <div className="w-48"><PixelButton variant="primary">Primario</PixelButton></div>
          <div className="w-48"><PixelButton variant="secondary">Secundario</PixelButton></div>
          <div className="w-48"><PixelButton variant="ghost">Ghost</PixelButton></div>
        </Section>

        <Section title="☑️ PixelCheckbox">
          <PixelCheckbox checked={checked} onChange={(e) => setChecked(e.target.checked)}>
            Mostrar respuestas
          </PixelCheckbox>
        </Section>

        <Section title="🎚️ PixelSegmented">
          <div className="w-72">
            <PixelSegmented options={SEGMENTED_OPTIONS} value={segmented} onChange={setSegmented} />
          </div>
        </Section>

        <Section title="🏷️ PixelBadge" description="variant: 'brand' | 'mint' | 'sun' | 'blossom' | 'sky' | 'neutral'">
          <PixelBadge variant="mint">Disponible</PixelBadge>
          <PixelBadge variant="brand">Beta</PixelBadge>
          <PixelBadge variant="sun">Premium</PixelBadge>
          <PixelBadge variant="blossom">Próximamente</PixelBadge>
          <PixelBadge variant="neutral">IA</PixelBadge>
        </Section>

        <Section title="🃏 PixelCard" description="accent opcional: color del borde superior">
          <PixelCard className="w-56">
            <h3 className="text-deep font-bold mb-1">Sin accent</h3>
            <p className="text-deep/60 text-sm">Tarjeta base.</p>
          </PixelCard>
          <PixelCard accent="brand" className="w-56">
            <h3 className="text-deep font-bold mb-1">Recurso</h3>
            <p className="text-deep/60 text-sm">Con accent="brand".</p>
          </PixelCard>
          <PixelCard accent="mint" className="w-56">
            <h3 className="text-deep font-bold mb-1">Máquina</h3>
            <p className="text-deep/60 text-sm">Con accent="mint".</p>
          </PixelCard>
        </Section>

        <Section title="📝 PixelInput" description="label, hint y error opcionales">
          <div className="w-64"><PixelInput label="Título" placeholder="Crucigrama" /></div>
          <div className="w-64"><PixelInput label="Palabra" hint="Mínimo 2 letras" /></div>
          <div className="w-64"><PixelInput label="Palabra" error="Muy corta" defaultValue="A" /></div>
        </Section>

        <Section title="🔽 PixelSelect">
          <div className="w-64">
            <PixelSelect
              label="Materia"
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              options={SELECT_OPTIONS}
            />
          </div>
        </Section>

        <Section title="📑 PixelTabs">
          <div className="w-full">
            <PixelTabs tabs={TABS} value={tab} onChange={setTab} />
            <p className="text-deep/50 text-sm mt-3">
              Tab activo: <span className="text-deep">{tab}</span>
            </p>
          </div>
        </Section>

        <Section title="🪟 PixelModal / PixelToast">
          <PixelButton variant="primary" onClick={() => setModalOpen(true)}>
            Abrir modal
          </PixelButton>
          <PixelButton variant="secondary" onClick={() => setToastVisible(true)}>
            Mostrar toast
          </PixelButton>

          {modalOpen && (
            <PixelModal title="EJEMPLO" icon="🐧" onClose={() => setModalOpen(false)}>
              <p className="text-deep/70">Contenido de ejemplo dentro de PixelModal.</p>
              <PixelButton variant="primary" onClick={() => setModalOpen(false)}>
                Cerrar
              </PixelButton>
            </PixelModal>
          )}

          {toastVisible && (
            <PixelToast
              message="¡Recurso descargado con éxito!"
              variant="mint"
              onClose={() => setToastVisible(false)}
            />
          )}
        </Section>

        {/* ============ components/auri ============ */}
        <p className="font-label text-[9px] tracking-widest text-brand/70 mb-6">🐧 COMPONENTS/AURI</p>

        <Section title="🐧 AuriNote" description="Aviso suave post-generación. Nunca para errores duros.">
          <div className="w-96">
            <AuriNote line="Qué bonita idea." />
          </div>
        </Section>

        {/* ============ components/laboratorio ============ */}
        <p className="font-label text-[9px] tracking-widest text-brand/70 mb-6">🧪 COMPONENTS/LABORATORIO</p>

        <Section title="📭 EmptyPreview">
          <div className="w-96">
            <EmptyPreview>Tu crucigrama va a aparecer aquí.</EmptyPreview>
          </div>
        </Section>

        <Section
          title="🧰 PixelPanel + PixelField (composición completa)"
          description="Así se ven combinados dentro de un generador real, como en Crucigramas.jsx."
        >
          <div className="w-full max-w-sm">
            <PixelPanel title="MÁQUINA DE EJEMPLO" icon="🧩">
              <PixelField label="Campo de texto" hint="Este es un hint de ayuda.">
                <PixelInput placeholder="Escribe algo..." />
              </PixelField>
              <PixelField label="Tamaño">
                <PixelSegmented options={SEGMENTED_OPTIONS} value={segmented} onChange={setSegmented} />
              </PixelField>
              <PixelField>
                <PixelCheckbox checked={checked} onChange={(e) => setChecked(e.target.checked)}>
                  Mostrar respuestas
                </PixelCheckbox>
              </PixelField>
              <PixelButton onClick={() => {}}>✨ Generar</PixelButton>
            </PixelPanel>
          </div>
        </Section>

        <Section title="📄 SheetHeader" description="Encabezado de la hoja imprimible.">
          <div className="w-full bg-white border-2 border-deep p-6">
            <SheetHeader title="Crucigrama" showName showCourse showDate extraLabel="Materia" />
          </div>
        </Section>
      </section>
    </div>
  )
}
