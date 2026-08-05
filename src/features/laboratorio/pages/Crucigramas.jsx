import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { generateCrossword, normalizeWord } from '../utils/crosswordGenerator.js'
import { PixelButton, PixelCheckbox, PixelSegmented } from '../../../components/ui'
import { AuriNote } from '../../../components/auri'
import { PixelPanel, PixelField, SheetHeader, EmptyPreview } from '../components'
import { Navbar, Footer, PageContainer } from '../../../components/layout'

const AURI_LINES = ['Buen trabajo.', 'Qué bonita idea.', '¿Probamos otra?', 'Me encantó.']

let nextId = 1
function newRow(word = '', clue = '') {
  return { id: nextId++, word, clue }
}

const EXAMPLE_ROWS = [
  newRow('SOL', 'Astro que ilumina el día'),
  newRow('LUNA', 'Satélite natural de la Tierra'),
  newRow('MAR', 'Gran extensión de agua salada'),
  newRow('CASA', 'Lugar donde vives'),
  newRow('ARBOL', 'Planta con tronco, ramas y hojas'),
]

const CELL_SIZE = {
  sm: { box: 'w-6 h-6 sm:w-7 sm:h-7', text: 'text-xs', num: 'text-[7px]', label: 'Pequeña' },
  md: { box: 'w-8 h-8 sm:w-9 sm:h-9', text: 'text-sm', num: 'text-[8px]', label: 'Mediana' },
  lg: { box: 'w-10 h-10 sm:w-11 sm:h-11', text: 'text-base', num: 'text-[9px]', label: 'Grande' },
}
const CELL_SIZE_OPTIONS = Object.entries(CELL_SIZE).map(([value, cfg]) => ({ value, label: cfg.label }))

export default function Crucigramas() {
  const [rows, setRows] = useState(EXAMPLE_ROWS)
  const [title, setTitle] = useState('Crucigrama')
  const [showName, setShowName] = useState(true)
  const [showCourse, setShowCourse] = useState(true)
  const [showDate, setShowDate] = useState(true)
  const [extraLabel, setExtraLabel] = useState('')
  const [cellSize, setCellSize] = useState('md')
  const [showAnswers, setShowAnswers] = useState(false)
  const [includeAnswerKeyPrint, setIncludeAnswerKeyPrint] = useState(false)

  const [result, setResult] = useState(null)
  const [auriLine, setAuriLine] = useState(null)
  const fileInputRef = useRef(null)

  function updateRow(id, field, value) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  function addRow() {
    setRows((prev) => [...prev, newRow()])
  }

  function removeRow(id) {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  // Sube/baja una palabra en la lista — el orden influye en qué tan bien
  // se cruzan entre sí, así que reordenar es más rápido que reescribir.
  function moveRow(id, direction) {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === id)
      const newIdx = idx + direction
      if (idx === -1 || newIdx < 0 || newIdx >= prev.length) return prev
      const copy = [...prev]
      const [item] = copy.splice(idx, 1)
      copy.splice(newIdx, 0, item)
      return copy
    })
  }

  function handleLoadExample() {
    setRows(EXAMPLE_ROWS)
  }

  function handleClearAll() {
    setRows([newRow()])
    setResult(null)
  }

  function handleGenerate() {
    const entries = rows
      .map((r) => ({ word: normalizeWord(r.word), clue: r.clue.trim() }))
      .filter((e) => e.word.length >= 2)
    if (entries.length === 0) return
    const generated = generateCrossword(entries)
    setResult(generated)
    setAuriLine(AURI_LINES[Math.floor(Math.random() * AURI_LINES.length)])
  }

  function handlePrint() {
    window.print()
  }

  // Importa palabras y pistas desde un archivo Excel/CSV: columna A = palabra,
  // columna B = pista (opcional). Si la primera fila es un encabezado
  // ("palabra"/"pista"), se ignora automáticamente.
  async function handleImportExcel(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })

      const parsed = data
        .filter((r) => r && r[0] !== undefined && r[0] !== null && String(r[0]).trim() !== '')
        .filter((r) => normalizeWord(String(r[0])) !== 'PALABRA') // salta el encabezado si dice "Palabra"
        .map((r) => newRow(normalizeWord(String(r[0])), r[1] ? String(r[1]).trim() : ''))
        .filter((r) => r.word.length >= 2)

      if (parsed.length > 0) {
        setRows(parsed)
        setResult(null)
      }
    } catch (err) {
      console.error('No se pudo leer el archivo:', err)
    } finally {
      e.target.value = ''
    }
  }

  // Genera y descarga una plantilla .xlsx en blanco con el formato esperado.
  function handleDownloadTemplate() {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['PALABRA', 'PISTA'],
      ['SOL', 'Astro que ilumina el día'],
      ['LUNA', 'Satélite natural de la Tierra'],
    ])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Palabras')
    XLSX.writeFile(workbook, 'plantilla-crucigrama.xlsx')
  }

  const size = CELL_SIZE[cellSize]

  return (
    <div className="min-h-screen bg-white">
      <Navbar backHref="#/laboratorio" backLabel="LABORATORIO" />

      <section className="pb-24">
       <PageContainer>
        <div className="text-center mb-10 no-print">
          <p className="font-label text-[10px] tracking-widest text-brand mb-4">🧩 GENERADOR</p>
          <h1 className="font-display text-4xl text-deep font-semibold mb-3">Crucigrama</h1>
          <p className="text-deep/70 max-w-md mx-auto">
            Una fila por palabra: la palabra a la izquierda, su pista a la derecha.
          </p>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
          <PixelPanel title="MÁQUINA DE CRUCIGRAMAS" icon="🧩">
            <PixelField label="Palabras y pistas">
              <div className="flex gap-2 mb-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleImportExcel}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 text-xs font-medium text-deep border-2 border-deep py-1.5 bg-white hover:bg-cream transition-colors focus:outline-none"
                >
                  📥 Importar desde Excel
                </button>
                <button
                  onClick={handleDownloadTemplate}
                  className="shrink-0 text-xs font-medium text-deep/60 border-2 border-dashed border-deep/30 py-1.5 px-3 hover:border-deep hover:text-deep transition-colors focus:outline-none"
                >
                  Plantilla
                </button>
              </div>

              <div className="flex gap-2 mb-1.5 px-0.5">
                <span className="flex-1 font-label text-[8px] text-deep/40">PALABRA</span>
                <span className="flex-[2] font-label text-[8px] text-deep/40">PISTA (OPCIONAL)</span>
              </div>
              <div className="space-y-2">
                {rows.map((row, i) => (
                  <div key={row.id} className="flex gap-1.5 items-center">
                    <input
                      type="text"
                      value={row.word}
                      onChange={(e) => updateRow(row.id, 'word', e.target.value)}
                      placeholder={`PALABRA ${i + 1}`}
                      className="flex-1 min-w-0 border-2 border-deep p-2 text-sm font-medium uppercase text-deep focus:outline-none focus:border-brand bg-white"
                    />
                    <span className="text-deep/30 font-label text-xs shrink-0">—</span>
                    <input
                      type="text"
                      value={row.clue}
                      onChange={(e) => updateRow(row.id, 'clue', e.target.value)}
                      placeholder="pista"
                      className="flex-[2] min-w-0 border-2 border-deep p-2 text-sm text-deep focus:outline-none focus:border-brand bg-white"
                    />
                    <div className="flex flex-col shrink-0">
                      <button
                        onClick={() => moveRow(row.id, -1)}
                        disabled={i === 0}
                        className="w-5 h-3.5 flex items-center justify-center text-deep/40 hover:text-brand disabled:opacity-20 disabled:hover:text-deep/40 leading-none text-[10px]"
                        aria-label={`Subir palabra ${i + 1}`}
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveRow(row.id, 1)}
                        disabled={i === rows.length - 1}
                        className="w-5 h-3.5 flex items-center justify-center text-deep/40 hover:text-brand disabled:opacity-20 disabled:hover:text-deep/40 leading-none text-[10px]"
                        aria-label={`Bajar palabra ${i + 1}`}
                      >
                        ▼
                      </button>
                    </div>
                    <button
                      onClick={() => removeRow(row.id)}
                      className="shrink-0 w-7 h-7 flex items-center justify-center text-deep/40 hover:text-blossom hover:border-blossom border-2 border-transparent"
                      aria-label={`Eliminar palabra ${i + 1}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <PixelButton variant="ghost" onClick={addRow}>
                  + Agregar palabra
                </PixelButton>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleLoadExample}
                  className="flex-1 text-xs font-medium text-deep/60 border-2 border-dashed border-deep/30 py-1.5 hover:border-deep hover:text-deep hover:bg-white transition-colors focus:outline-none"
                >
                  Cargar ejemplo
                </button>
                <button
                  onClick={handleClearAll}
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
                placeholder="Crucigrama"
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

            <PixelField label="Tamaño de letra">
              <PixelSegmented options={CELL_SIZE_OPTIONS} value={cellSize} onChange={setCellSize} />
            </PixelField>

            <PixelField label="Opciones de impresión">
              <div className="flex flex-col gap-2">
                <PixelCheckbox checked={showAnswers} onChange={(e) => setShowAnswers(e.target.checked)}>
                  Mostrar respuestas en pantalla
                </PixelCheckbox>
                <PixelCheckbox
                  checked={includeAnswerKeyPrint}
                  onChange={(e) => setIncludeAnswerKeyPrint(e.target.checked)}
                >
                  Incluir hoja de respuestas al imprimir (para ti)
                </PixelCheckbox>
              </div>
            </PixelField>

            <PixelButton onClick={handleGenerate}>✨ Generar</PixelButton>

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

            {result && result.unplaced.length > 0 && (
              <p className="text-xs text-deep/60">
                No se pudieron cruzar: {result.unplaced.join(', ')}. Prueba reordenando las
                palabras o usando otras que compartan más letras entre sí.
              </p>
            )}

            <AuriNote line={auriLine} />
          </PixelPanel>

          {/* Resultado / Hoja imprimible */}
          <div className="printable">
            {!result && <EmptyPreview>Tu crucigrama va a aparecer aquí.</EmptyPreview>}

            {result && result.rows > 0 && (
              <div className="bg-white border-2 border-deep p-6 sm:p-8">
                <SheetHeader
                  title={title}
                  badge={showAnswers ? '(respuestas)' : null}
                  showName={showName}
                  showCourse={showCourse}
                  showDate={showDate}
                  extraLabel={extraLabel}
                />

                <div
                  className="grid w-fit mx-auto"
                  style={{ gridTemplateColumns: `repeat(${result.cols}, minmax(0, 1fr))` }}
                >
                  {result.cells.map((row, r) =>
                    row.map((letter, c) => {
                      const number = result.numbers.get(`${r},${c}`)
                      if (letter === null) {
                        return <div key={`${r}-${c}`} className={`${size.box} bg-deep`} />
                      }
                      return (
                        <div
                          key={`${r}-${c}`}
                          className={`${size.box} relative border border-deep flex items-center justify-center font-bold text-deep`}
                        >
                          {number && (
                            <span className={`absolute top-0 left-0.5 ${size.num} font-normal text-deep/70`}>
                              {number}
                            </span>
                          )}
                          <span className={size.text}>{showAnswers ? letter : ''}</span>
                        </div>
                      )
                    }),
                  )}
                </div>

                <div className="mt-8 grid sm:grid-cols-2 gap-8 max-w-2xl mx-auto text-left">
                  <div>
                    <p className="font-label text-[9px] tracking-wide text-brand mb-3">HORIZONTALES</p>
                    <ol className="space-y-2 text-sm text-deep">
                      {result.across.map((p) => (
                        <li key={`h-${p.number}`}>
                          <span className="font-semibold">{p.number}.</span>{' '}
                          {p.clue ? (
                            <>
                              {p.clue} <span className="italic text-deep/40">({p.word.length} letras)</span>
                            </>
                          ) : (
                            <span className="italic text-deep/40">(completa la pista — {p.word.length} letras)</span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <p className="font-label text-[9px] tracking-wide text-brand mb-3">VERTICALES</p>
                    <ol className="space-y-2 text-sm text-deep">
                      {result.down.map((p) => (
                        <li key={`v-${p.number}`}>
                          <span className="font-semibold">{p.number}.</span>{' '}
                          {p.clue ? (
                            <>
                              {p.clue} <span className="italic text-deep/40">({p.word.length} letras)</span>
                            </>
                          ) : (
                            <span className="italic text-deep/40">(completa la pista — {p.word.length} letras)</span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* HOJA DE RESPUESTAS — página aparte al imprimir, siempre con las
                letras reveladas, sin depender del toggle de pantalla. */}
            {result && result.rows > 0 && includeAnswerKeyPrint && (
              <div className="answer-key-page mt-10 pt-10 border-t-4 border-dashed border-deep/20">
                <p className="no-print text-center font-label text-[9px] tracking-widest text-brand mb-4">
                  🔑 HOJA DE RESPUESTAS — SOLO PARA EL DOCENTE
                </p>
                <div className="bg-white border-2 border-deep p-6 sm:p-8">
                  <SheetHeader
                    title={`${title} — Respuestas`}
                  />

                  <div
                    className="grid w-fit mx-auto"
                    style={{ gridTemplateColumns: `repeat(${result.cols}, minmax(0, 1fr))` }}
                  >
                    {result.cells.map((row, r) =>
                      row.map((letter, c) => {
                        const number = result.numbers.get(`${r},${c}`)
                        if (letter === null) {
                          return <div key={`ak-${r}-${c}`} className={`${size.box} bg-deep`} />
                        }
                        return (
                          <div
                            key={`ak-${r}-${c}`}
                            className={`${size.box} relative border border-deep flex items-center justify-center font-bold text-deep bg-mint/40`}
                          >
                            {number && (
                              <span className={`absolute top-0 left-0.5 ${size.num} font-normal text-deep/70`}>
                                {number}
                              </span>
                            )}
                            <span className={size.text}>{letter}</span>
                          </div>
                        )
                      }),
                    )}
                  </div>

                  <div className="mt-8 grid sm:grid-cols-2 gap-8 max-w-2xl mx-auto text-left">
                    <div>
                      <p className="font-label text-[9px] tracking-wide text-brand mb-3">HORIZONTALES</p>
                      <ol className="space-y-2 text-sm text-deep">
                        {result.across.map((p) => (
                          <li key={`ak-h-${p.number}`}>
                            <span className="font-semibold">{p.number}.</span> {p.clue || '—'}{' '}
                            <span className="font-semibold text-brand">— {p.word}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <p className="font-label text-[9px] tracking-wide text-brand mb-3">VERTICALES</p>
                      <ol className="space-y-2 text-sm text-deep">
                        {result.down.map((p) => (
                          <li key={`ak-v-${p.number}`}>
                            <span className="font-semibold">{p.number}.</span> {p.clue || '—'}{' '}
                            <span className="font-semibold text-brand">— {p.word}</span>
                          </li>
                        ))}
                      </ol>
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
