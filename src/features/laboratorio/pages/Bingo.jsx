import { useState } from 'react'
import { generateBingoCards, generateCallOrder } from '../utils/bingoGenerator.js'
import { PixelCheckbox, PixelSegmented, PixelButton } from '../../../components/ui'
import { AuriNote } from '../../../components/auri'
import { PixelPanel, PixelField, SheetHeader, EmptyPreview } from '../components'
import { Navbar, Footer, PageContainer } from '../../../components/layout'

const AURI_LINES = ['Buen trabajo.', 'Qué bonita idea.', '¿Probamos otra?', 'Me encantó.']

const EXAMPLE =
  'PERRO\nGATO\nLEON\nTIGRE\nOSO\nLOBO\nZORRO\nCONEJO\nCABALLO\nVACA\nCERDO\nOVEJA\nCABRA\nGALLINA\nPATO\nGANSO\nELEFANTE\nJIRAFA\nMONO\nCEBRA\nRINOCERONTE\nHIPOPOTAMO\nCOCODRILO\nSERPIENTE\nTORTUGA\nRANA\nPEZ\nDELFIN\nBALLENA\nPULPO'

const SIZE_OPTIONS = [
  { value: '3', label: '3 x 3' },
  { value: '4', label: '4 x 4' },
  { value: '5', label: '5 x 5' },
]

const CELL_SIZE = {
  sm: { box: 'text-[9px] sm:text-[10px] p-1', label: 'Pequeña' },
  md: { box: 'text-[10px] sm:text-xs p-1.5', label: 'Mediana' },
  lg: { box: 'text-xs sm:text-sm p-2', label: 'Grande' },
}
const CELL_SIZE_OPTIONS = Object.entries(CELL_SIZE).map(([value, cfg]) => ({ value, label: cfg.label }))

const NUM_CARDS_OPTIONS = [1, 5, 10, 15, 20, 25, 30, 40]

export default function Bingo() {
  const [input, setInput] = useState(EXAMPLE)
  const [title, setTitle] = useState('Bingo')
  const [showName, setShowName] = useState(true)
  const [showCourse, setShowCourse] = useState(true)
  const [showDate, setShowDate] = useState(true)
  const [extraLabel, setExtraLabel] = useState('')
  const [gridSize, setGridSize] = useState('5')
  const [freeCenter, setFreeCenter] = useState(true)
  const [numCards, setNumCards] = useState(10)
  const [cellSize, setCellSize] = useState('md')
  const [includeCallList, setIncludeCallList] = useState(true)

  const [result, setResult] = useState(null)
  const [callOrder, setCallOrder] = useState([])
  const [previewIndex, setPreviewIndex] = useState(0)
  const [auriLine, setAuriLine] = useState(null)

  const size = Number(gridSize)
  const isOdd = size % 2 === 1

  function handleGenerate() {
    const items = input.split('\n').filter((w) => w.trim().length > 0)
    if (items.length === 0) return
    const generated = generateBingoCards(items, {
      size,
      numCards,
      freeCenter: freeCenter && isOdd,
    })
    setResult(generated)
    setCallOrder(generated.ok ? generateCallOrder(items) : [])
    setPreviewIndex(0)
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

  const cell = CELL_SIZE[cellSize]

  return (
    <div className="min-h-screen bg-white">
      <Navbar backHref="#/laboratorio" backLabel="LABORATORIO" />

      <section className="pb-24">
        <PageContainer>
          <div className="text-center mb-8 sm:mb-10 no-print px-2">
            <p className="font-label text-[10px] tracking-widest text-brand mb-4">🎱 GENERADOR</p>
            <h1 className="font-display text-3xl sm:text-4xl text-deep font-semibold mb-3">Bingo</h1>
            <p className="text-deep/70 max-w-md mx-auto text-sm sm:text-base">
              Escribe los elementos, elige cuántos cartones distintos necesitas, y genera uno por
              cada estudiante.
            </p>
          </div>

          <div className="grid lg:grid-cols-[340px_1fr] gap-6 sm:gap-8 items-start">
            <PixelPanel title="MÁQUINA DE BINGO" icon="🎱">
              <PixelField
                label="Elementos (uno por línea)"
                hint="Cuantos más elementos escribas, más distintos van a ser los cartones entre sí."
              >
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
                  placeholder="Bingo"
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

              <PixelField label="Tamaño de la grilla">
                <PixelSegmented options={SIZE_OPTIONS} value={gridSize} onChange={setGridSize} />
              </PixelField>

              {isOdd && (
                <PixelField>
                  <PixelCheckbox checked={freeCenter} onChange={(e) => setFreeCenter(e.target.checked)}>
                    Casillero central "GRATIS"
                  </PixelCheckbox>
                </PixelField>
              )}

              <PixelField
                label="Cantidad de cartones"
                hint="Uno por estudiante — así nadie tiene el mismo cartón que su compañero de al lado."
              >
                <div className="flex flex-wrap gap-2">
                  {NUM_CARDS_OPTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNumCards(n)}
                      className={`px-3 py-1.5 text-xs font-medium border-2 border-deep transition-colors ${
                        numCards === n ? 'bg-brand text-white' : 'bg-white text-deep hover:bg-sky/20'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </PixelField>

              <PixelField label="Tamaño de letra">
                <PixelSegmented options={CELL_SIZE_OPTIONS} value={cellSize} onChange={setCellSize} />
              </PixelField>

              <PixelField label="Opciones de impresión">
                <PixelCheckbox checked={includeCallList} onChange={(e) => setIncludeCallList(e.target.checked)}>
                  Incluir lista para cantar (para ti)
                </PixelCheckbox>
              </PixelField>

              <PixelButton onClick={handleGenerate}>✨ Generar {numCards} cartones</PixelButton>

              {result && (
                <>
                  <PixelButton variant="ghost" onClick={handleGenerate}>
                    🔀 Otra variante
                  </PixelButton>
                  <PixelButton variant="secondary" onClick={handlePrint}>
                    🖨️ Imprimir / Guardar como PDF
                  </PixelButton>
                </>
              )}

              {result && !result.ok && (
                <p className="text-xs text-deep/60">
                  Te faltan elementos: la grilla de {result.size}×{result.size} necesita al menos{' '}
                  {result.cellsNeeded}, y escribiste {result.available}. Agrega algunos más o achica
                  la grilla.
                </p>
              )}

              <AuriNote line={auriLine} />
            </PixelPanel>

            {/* Vista previa / Hoja imprimible */}
            <div className="min-w-0">
              {(!result || !result.ok) && (
                <div className="no-print">
                  <EmptyPreview>Tus cartones de bingo van a aparecer aquí.</EmptyPreview>
                </div>
              )}

              {result && result.ok && (
                <>
                  {/* Selector de vista previa — no se imprime, solo sirve para
                      revisar en pantalla que los cartones salieron bien
                      antes de mandar todo a imprimir. */}
                  {result.cards.length > 1 && (
                    <div className="no-print flex items-center justify-center gap-3 mb-4">
                      <button
                        onClick={() => setPreviewIndex((i) => Math.max(0, i - 1))}
                        disabled={previewIndex === 0}
                        className="w-8 h-8 border-2 border-deep bg-white text-deep disabled:opacity-30 hover:bg-cream"
                        aria-label="Cartón anterior"
                      >
                        ◀
                      </button>
                      <span className="font-label text-[9px] tracking-wide text-deep/60">
                        VISTA PREVIA — CARTÓN {previewIndex + 1} DE {result.cards.length}
                      </span>
                      <button
                        onClick={() => setPreviewIndex((i) => Math.min(result.cards.length - 1, i + 1))}
                        disabled={previewIndex === result.cards.length - 1}
                        className="w-8 h-8 border-2 border-deep bg-white text-deep disabled:opacity-30 hover:bg-cream"
                        aria-label="Cartón siguiente"
                      >
                        ▶
                      </button>
                    </div>
                  )}

                  <div className="printable">
                    {result.cards.map((card, i) => (
                      <div
                        key={i}
                        className={`bg-white border-2 border-deep p-4 sm:p-8 ${
                          i === previewIndex ? '' : 'hidden print:block'
                        } ${i > 0 ? 'print:mt-0' : ''}`}
                        style={i > 0 ? { breakBefore: 'page' } : undefined}
                      >
                        <SheetHeader
                          title={title}
                          badge={result.cards.length > 1 ? `#${i + 1}` : null}
                          showName={showName}
                          showCourse={showCourse}
                          showDate={showDate}
                          extraLabel={extraLabel}
                        />
                        <div className="overflow-x-auto">
                          <div
                            className="grid gap-1 sm:gap-1.5 border-2 border-deep p-1.5 sm:p-2 w-fit mx-auto bg-white"
                            style={{ gridTemplateColumns: `repeat(${result.size}, minmax(0, 1fr))` }}
                          >
                            {card.grid.map((row, r) =>
                              row.map((item, c) => (
                                <div
                                  key={`${r}-${c}`}
                                  className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-center border border-deep/20 font-semibold leading-tight break-words ${cell.box} ${
                                    item.free ? 'bg-mint/40 text-deep' : 'text-deep'
                                  }`}
                                >
                                  {item.text}
                                </div>
                              )),
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* LISTA PARA CANTAR — página aparte al imprimir, solo para
                      el docente, con el orden en que se van a ir leyendo los
                      elementos durante el juego. */}
                  {includeCallList && (
                    <div className="answer-key-page mt-10 pt-10 border-t-4 border-dashed border-deep/20">
                      <p className="no-print text-center font-label text-[9px] tracking-widest text-brand mb-4">
                        🔑 LISTA PARA CANTAR — SOLO PARA EL DOCENTE
                      </p>
                      <div className="bg-white border-2 border-deep p-4 sm:p-8">
                        <SheetHeader title={`${title} — Lista para cantar`} />
                        <ol className="max-w-lg mx-auto grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm text-deep">
                          {callOrder.map((item, i) => (
                            <li key={item}>
                              <span className="font-semibold text-brand">{i + 1}.</span> {item}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </PageContainer>
      </section>

      <Footer />
    </div>
  )
}