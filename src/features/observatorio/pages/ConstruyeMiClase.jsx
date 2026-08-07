import { useState } from 'react'
import { BLOCK_TYPES, RESOURCE_OPTIONS, getSuggestions } from '../data/lessonBuilderData.js'
import { PixelCheckbox, PixelSegmented, PixelButton } from '../../../components/ui'
import { AuriNote } from '../../../components/auri'
import { PixelPanel, PixelField, EmptyPreview } from '../../laboratorio/components'
import { Navbar, Footer, PageContainer } from '../../../components/layout'

const DURATION_OPTIONS = [
  { value: '40', label: '40 min' },
  { value: '60', label: '60 min' },
  { value: '80', label: '80 min' },
]

const AURI_LINES = ['Buen trabajo.', 'Qué bonita idea.', '¿Probamos otra?', 'Me encantó.']

let nextBlockId = 1
function makeBlock(type) {
  return { id: nextBlockId++, type, content: '', suggestionsOpen: false }
}

function BlockCard({ block, index, total, tema, resources, onMove, onRemove, onChangeContent, onToggleSuggestions, onPickSuggestion }) {
  const meta = BLOCK_TYPES.find((b) => b.id === block.type)
  const suggestions = block.suggestionsOpen ? getSuggestions(block.type, tema, resources) : []

  return (
    <div className="border-2 border-deep bg-white dark:bg-deep dark:border-cream/40">
      <div className="flex items-center gap-2 bg-deep/5 border-b-2 border-deep px-3 py-2 dark:bg-cream/5 dark:border-cream/30">
        <span className="text-lg" aria-hidden="true">{meta?.emoji}</span>
        <span className="font-label text-[9px] tracking-widest text-deep/70 flex-1 dark:text-cream/70">{meta?.label}</span>
        <button
          onClick={() => onMove(block.id, -1)}
          disabled={index === 0}
          className="w-6 h-6 flex items-center justify-center text-deep/50 hover:text-deep disabled:opacity-20 disabled:cursor-not-allowed dark:text-cream/50 dark:hover:text-cream"
          aria-label="Mover arriba"
        >
          ↑
        </button>
        <button
          onClick={() => onMove(block.id, 1)}
          disabled={index === total - 1}
          className="w-6 h-6 flex items-center justify-center text-deep/50 hover:text-deep disabled:opacity-20 disabled:cursor-not-allowed dark:text-cream/50 dark:hover:text-cream"
          aria-label="Mover abajo"
        >
          ↓
        </button>
        <button
          onClick={() => onRemove(block.id)}
          className="w-6 h-6 flex items-center justify-center text-deep/40 hover:text-blossom dark:text-cream/40"
          aria-label="Eliminar bloque"
        >
          ✕
        </button>
      </div>

      <div className="p-3 space-y-2">
        <textarea
          value={block.content}
          onChange={(e) => onChangeContent(block.id, e.target.value)}
          rows={2}
          placeholder={`Escribe aquí, o pídele una idea a Auri →`}
          className="w-full border-2 border-deep p-2 text-sm text-deep focus:outline-none focus:border-brand bg-white resize-none dark:text-cream dark:border-cream/40 dark:bg-deep"
        />

        <button
          onClick={() => onToggleSuggestions(block.id)}
          className="inline-flex items-center gap-1.5 text-xs font-label tracking-wide text-brand hover:underline"
        >
          <img src="./auri-cara.png" alt="" className="w-4 h-4 object-contain" aria-hidden="true" />
          {block.suggestionsOpen ? 'ocultar ideas' : 'auri sugiere'}
        </button>

        {block.suggestionsOpen && (
          <div className="space-y-1.5 pt-1">
            {suggestions.length === 0 && (
              <p className="text-xs text-deep/50 italic">
                Con los recursos que marcaste, no tengo una idea para este bloque todavía.
              </p>
            )}
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onPickSuggestion(block.id, s)}
                className="w-full text-left text-xs text-deep/80 bg-cream border border-deep/20 hover:border-brand px-2.5 py-2 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ConstruyeMiClase() {
  const [tema, setTema] = useState('')
  const [duration, setDuration] = useState('60')
  const [resources, setResources] = useState([])
  const [blocks, setBlocks] = useState([])
  const [auriLine, setAuriLine] = useState(null)
  const [copied, setCopied] = useState(false)

  function toggleResource(id) {
    setResources((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
  }

  function addBlock(type) {
    setBlocks((prev) => [...prev, makeBlock(type)])
    setAuriLine(AURI_LINES[Math.floor(Math.random() * AURI_LINES.length)])
  }

  function moveBlock(id, dir) {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === id)
      const j = i + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  function removeBlock(id) {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
  }

  function updateContent(id, text) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content: text } : b)))
  }

  function toggleSuggestions(id) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, suggestionsOpen: !b.suggestionsOpen } : b)))
  }

  function pickSuggestion(id, text) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content: text, suggestionsOpen: false } : b)))
    setAuriLine(AURI_LINES[Math.floor(Math.random() * AURI_LINES.length)])
  }

  async function handleCopy() {
    const lines = [
      `Clase: ${tema.trim() || '(sin tema)'} — ${duration} min`,
      '',
      ...blocks.map((b) => {
        const meta = BLOCK_TYPES.find((m) => m.id === b.type)
        return `${meta?.emoji} ${meta?.label}: ${b.content || '(vacío)'}`
      }),
    ]
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Portapapeles no disponible — no bloquea el resto de la app.
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-deep">
      <Navbar backHref="#/observatorio" backLabel="OBSERVATORIO" />

      <section className="pb-24">
       <PageContainer>
        <div className="text-center mb-10 no-print">
          <p className="font-label text-[10px] tracking-widest text-brand mb-4">🌙 CONSTRUYE MI CLASE</p>
          <h1 className="font-display text-4xl text-deep font-semibold mb-3">
            Un lienzo, no un chat
          </h1>
          <p className="text-deep/70 max-w-lg mx-auto">
            Añade bloques como si armaras LEGO. Pídele una idea a Auri en cualquier bloque —
            hoy son plantillas de ejemplo; cuando conectemos la IA real, esta misma pantalla
            seguirá funcionando igual.
          </p>
          <span className="inline-block mt-3 font-label text-[9px] tracking-wide bg-sun/30 border border-deep px-2 py-1 text-deep">
            🧪 PROTOTIPO — SUGERENCIAS SIMULADAS
          </span>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-8 items-start">
          <PixelPanel title="TABLERO DE CLASE" icon="🌙">
            <PixelField label="¿Qué quieres enseñar?">
              <input
                type="text"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder="ej. el sistema solar"
                className="w-full border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
              />
            </PixelField>

            <PixelField label="Duración de la clase">
              <PixelSegmented options={DURATION_OPTIONS} value={duration} onChange={setDuration} />
            </PixelField>

            <PixelField label="Recursos disponibles" hint="La pizarra siempre cuenta. Marca lo demás que sí tengas.">
              <div className="flex flex-col gap-2">
                {RESOURCE_OPTIONS.map((r) => (
                  <PixelCheckbox key={r.id} checked={resources.includes(r.id)} onChange={() => toggleResource(r.id)}>
                    {r.label}
                  </PixelCheckbox>
                ))}
              </div>
            </PixelField>

            <PixelField label="Agregar bloque">
              <div className="grid grid-cols-3 gap-2">
                {BLOCK_TYPES.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => addBlock(b.id)}
                    className="flex flex-col items-center gap-1 border-2 border-deep bg-white p-2.5 hover:bg-sky/20 hover:translate-x-[1px] hover:translate-y-[1px] transition-all dark:bg-deep dark:border-cream/40 dark:hover:bg-cream/10"
                  >
                    <span className="text-lg" aria-hidden="true">{b.emoji}</span>
                    <span className="text-[10px] text-deep/70 leading-tight text-center dark:text-cream/70">{b.label}</span>
                  </button>
                ))}
              </div>
            </PixelField>

            {blocks.length > 0 && (
              <PixelButton variant="secondary" onClick={handleCopy}>
                {copied ? '✓ Copiado' : '📋 Copiar plan como texto'}
              </PixelButton>
            )}

            <AuriNote line={auriLine} />
          </PixelPanel>

          <div>
            {blocks.length === 0 && (
              <EmptyPreview>
                Tu clase todavía no tiene bloques. Empieza agregando un 🎯 Objetivo.
              </EmptyPreview>
            )}

            {blocks.length > 0 && (
              <div className="space-y-3">
                {blocks.map((block, i) => (
                  <BlockCard
                    key={block.id}
                    block={block}
                    index={i}
                    total={blocks.length}
                    tema={tema}
                    resources={resources}
                    onMove={moveBlock}
                    onRemove={removeBlock}
                    onChangeContent={updateContent}
                    onToggleSuggestions={toggleSuggestions}
                    onPickSuggestion={pickSuggestion}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
       </PageContainer>
      </section>

      <Footer />
    </div>
  )
}