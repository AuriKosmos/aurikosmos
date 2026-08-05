import { useState } from 'react'
import { generateWordSearch, DIFFICULTY_DIRECTIONS } from '../utils/wordSearchGenerator.js'
import { PixelCheckbox, PixelSegmented, PixelButton, PixelSelect } from '../../../components/ui'
import { AuriNote } from '../../../components/auri'
import { PixelPanel, PixelField, SheetHeader, EmptyPreview } from '../components'
import { Navbar, Footer, PageContainer } from '../../../components/layout'

const AURI_LINES = ['Buen trabajo.', 'Qué bonita idea.', '¿Probamos otra?', 'Me encantó.']

const EXAMPLE = 'PERRO\nGATO\nLEON\nELEFANTE\nJIRAFA\nTIGRE'

const CELL_SIZE = {
  sm: { box: 'w-5 h-5 sm:w-6 sm:h-6', text: 'text-[10px]', label: 'Pequeña' },
  md: { box: 'w-7 h-7 sm:w-8 sm:h-8', text: 'text-sm', label: 'Mediana' },
  lg: { box: 'w-9 h-9 sm:w-10 sm:h-10', text: 'text-base', label: 'Grande' },
}
const CELL_SIZE_OPTIONS = Object.entries(CELL_SIZE).map(([value, cfg]) => ({ value, label: cfg.label }))

const GRID_SIZE_OPTIONS = [
  { value: 'auto', label: 'Automática (según las palabras)', size: null },
  { value: '12', label: 'Pequeña — 12 x 12', size: 12 },
  { value: '16', label: 'Mediana — 16 x 16', size: 16 },
  { value: '20', label: 'Grande — 20 x 20', size: 20 },
  { value: '24', label: 'Extra grande — 24 x 24', size: 24 },
]

const DIFFICULTY_OPTIONS = [
  { value: 'facil', label: 'Fácil' },
  { value: 'media', label: 'Media' },
  { value: 'dificil', label: 'Difícil' },
]

export default function SopaDeLetras() {
  const [input, setInput] = useState(EXAMPLE)
  const [title, setTitle] = useState('Sopa de letras')
  const [showName, setShowName] = useState(true)
  const [showCourse, setShowCourse] = useState(true)
  const [showDate, setShowDate] = useState(true)
  const [extraLabel, setExtraLabel] = useState('')
  const [cellSize, setCellSize] = useState('md')
  const [gridSizeChoice, setGridSizeChoice] = useState('auto')
  const [difficulty, setDifficulty] = useState('dificil')
  const [showWordList, setShowWordList] = useState(true)
  const [includeAnswerKey, setIncludeAnswerKey] = useState(false)

  const [result, setResult] = useState(null)
  const [auriLine, setAuriLine] = useState(null)

  function handleGenerate() {
    const words = input.split('\n').filter((w) => w.trim().length > 0)
    if (words.length === 0) return
    const targetSize = GRID_SIZE_OPTIONS.find((o) => o.value === gridSizeChoice)?.size ?? null
    const generated = generateWordSearch(words, {
      targetSize,
      directions: DIFFICULTY_DIRECTIONS[difficulty],
    })
    setResult(generated)
    setAuriLine(AURI_LINES[Math.floor(Math.random() * AURI_LINES.length)])
  }

  function handlePrint() {
    window.print()
  }

  function handleLoadExample() {
    setInput(EXAMPLE)
  }

  function handleClear() {
    setInput('')
  }

  const size = CELL_SIZE[cellSize]
  // Set de celdas "r-c" que pertenecen a alguna palabra colocada — para
  // pintarlas en la hoja de respuestas del docente.
  const answerCells = result
    ? new Set(result.placements.flatMap((p) => p.cells.map(([r, c]) => `${r}-${c}`)))
    : new Set()

  return (
    <div className="min-h-screen bg-white">
      <Navbar backHref="#/laboratorio" backLabel="LABORATORIO" />

      <section className="pb-24">
       <PageContainer>
        <div className="text-center mb-10 no-print">
          <p className="font-label text-[10px] tracking-widest text-brand mb-4">🔤 GENERADOR</p>
          <h1 className="font-display text-4xl text-deep font-semibold mb-3">Sopa de letras</h1>
          <p className="text-deep/70 max-w-md mx-auto">
            Escribe las palabras, ajusta el formato de la hoja, y genera.
          </p>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-8 items-start">
          <PixelPanel title="MÁQUINA DE SOPA DE LETRAS" icon="🔤">
            <PixelField label="Palabras (una por línea)">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={8}
                className="w-full border-2 border-deep p-3 font-body text-sm text-deep focus:outline-none focus:border-brand resize-none bg-white"
                placeholder={'PERRO\nGATO\nLEON'}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleLoadExample}
                  className="flex-1 text-xs font-medium text-deep/60 border-2 border-dashed border-deep/30 py-1.5 hover:border-deep hover:text-deep hover:bg-white transition-colors focus:outline-none"
                >
                  Cargar ejemplo
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 text-xs font-medium text-deep/60 border-2 border-dashed border-deep/30 py-1.5 hover:border-deep hover:text-deep hover:bg-white transition-colors focus:outline-none"
                >
                  Limpiar
                </button>
              </div>
            </PixelField>

            <PixelField label="Título de la hoja">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus:border-brand bg-white"
                placeholder="Sopa de letras"
              />
            </PixelField>

            <PixelField label="Campos del encabezado">
              <div className="flex flex-col gap-2">
                <PixelCheckbox checked={showName} onChange={(e) => setShowName(e.target.checked)}>
                  Nombre
                </PixelCheckbox>
                <PixelCheckbox checked={showCourse} onChange={(e) => setShowCourse(e.target.checked)}>
                  Curso
                </PixelCheckbox>
                <PixelCheckbox checked={showDate} onChange={(e) => setShowDate(e.target.checked)}>
                  Fecha
                </PixelCheckbox>
              </div>
              <input
                type="text"
                value={extraLabel}
                onChange={(e) => setExtraLabel(e.target.value)}
                className="mt-3 w-full border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus:border-brand bg-white"
                placeholder="Campo extra (ej. Materia) — opcional"
              />
            </PixelField>

            <PixelField
              label="Dificultad"
              hint="Fácil: solo horizontal y vertical. Media: + diagonales. Difícil: + palabras al revés."
            >
              <PixelSegmented options={DIFFICULTY_OPTIONS} value={difficulty} onChange={setDifficulty} />
            </PixelField>

            <PixelField label="Tamaño de letra">
              <PixelSegmented options={CELL_SIZE_OPTIONS} value={cellSize} onChange={setCellSize} />
            </PixelField>

            <PixelField hint="Si eliges una grilla chica y las palabras no caben, se agranda lo mínimo necesario.">
              <PixelSelect
                label="Tamaño de la grilla"
                value={gridSizeChoice}
                onChange={(e) => setGridSizeChoice(e.target.value)}
                options={GRID_SIZE_OPTIONS}
              />
            </PixelField>

            <PixelField label="Opciones de impresión">
              <div className="flex flex-col gap-2">
                <PixelCheckbox checked={showWordList} onChange={(e) => setShowWordList(e.target.checked)}>
                  Mostrar lista de palabras
                </PixelCheckbox>
                <PixelCheckbox
                  checked={includeAnswerKey}
                  onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                >
                  Incluir hoja de respuestas (para ti)
                </PixelCheckbox>
              </div>
            </PixelField>

            <PixelButton onClick={handleGenerate}>✨ Generar</PixelButton>

            {result && (
              <PixelButton variant="secondary" onClick={handlePrint}>
                🖨️ Imprimir / Guardar como PDF
              </PixelButton>
            )}

            {result && result.unplaced.length > 0 && (
              <p className="text-xs text-deep/60">
                No cupieron en la grilla: {result.unplaced.join(', ')}. Prueba con una grilla más
                grande o palabras más cortas.
              </p>
            )}

            <AuriNote line={auriLine} />
          </PixelPanel>

          {/* Resultado / Hoja imprimible */}
          <div className="printable">
            {!result && <EmptyPreview>Tu sopa de letras va a aparecer aquí.</EmptyPreview>}

            {result && result.size > 0 && (
              <div className="bg-white border-2 border-deep p-6 sm:p-8">
                <SheetHeader
                  title={title}
                  showName={showName}
                  showCourse={showCourse}
                  showDate={showDate}
                  extraLabel={extraLabel}
                />

                <div
                  className="grid border-2 border-deep w-fit mx-auto bg-white"
                  style={{ gridTemplateColumns: `repeat(${result.size}, minmax(0, 1fr))` }}
                >
                  {result.grid.map((row, r) =>
                    row.map((letter, c) => (
                      <div
                        key={`${r}-${c}`}
                        className={`${size.box} ${size.text} flex items-center justify-center border border-deep/10 font-bold text-deep`}
                      >
                        {letter}
                      </div>
                    )),
                  )}
                </div>

                {showWordList && (
                  <div className="mt-8 max-w-md mx-auto">
                    <p className="font-label text-[9px] tracking-wide text-brand mb-3 text-center">
                      PALABRAS A ENCONTRAR
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {result.placed.map((w) => (
                        <span
                          key={w}
                          className="bg-sky/30 border-2 border-deep px-3 py-1 text-sm font-medium text-deep"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* HOJA DE RESPUESTAS — pensada solo para el docente, empieza en
                página nueva al imprimir y nunca se mezcla con la hoja del
                estudiante. */}
            {result && result.size > 0 && includeAnswerKey && (
              <div className="answer-key-page mt-10 pt-10 border-t-4 border-dashed border-deep/20">
                <p className="no-print text-center font-label text-[9px] tracking-widest text-brand mb-4">
                  🔑 HOJA DE RESPUESTAS — SOLO PARA EL DOCENTE
                </p>
                <div className="bg-white border-2 border-deep p-6 sm:p-8">
                  <SheetHeader title={`${title} — Respuestas`} />

                  <div
                    className="grid border-2 border-deep w-fit mx-auto bg-white"
                    style={{ gridTemplateColumns: `repeat(${result.size}, minmax(0, 1fr))` }}
                  >
                    {result.grid.map((row, r) =>
                      row.map((letter, c) => {
                        const isAnswer = answerCells.has(`${r}-${c}`)
                        return (
                          <div
                            key={`${r}-${c}`}
                            className={`${size.box} ${size.text} flex items-center justify-center border border-deep/10 font-bold ${
                              isAnswer ? 'bg-mint/50 text-deep' : 'text-deep/30'
                            }`}
                          >
                            {letter}
                          </div>
                        )
                      }),
                    )}
                  </div>

                  <div className="mt-8 max-w-md mx-auto">
                    <p className="font-label text-[9px] tracking-wide text-brand mb-3 text-center">
                      PALABRAS Y SU UBICACIÓN
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {result.placed.map((w) => (
                        <span
                          key={w}
                          className="bg-mint/30 border-2 border-deep px-3 py-1 text-sm font-medium text-deep"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
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