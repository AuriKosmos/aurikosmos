import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { PixelButton, PixelCheckbox } from '../../../components/ui'
import { AuriNote } from '../../../components/auri'
import { PixelPanel, PixelField, EmptyPreview } from '../components'
import { Navbar, Footer, PageContainer } from '../../../components/layout'

const AURI_LINES = ['Quedó clara la rúbrica.', 'Buenos criterios.', '¿Ajustamos un nivel?', 'Así se evalúa mejor.']

const MODO_OPTIONS = [
  { value: 'analitica', label: 'Analítica', icon: '📊' },
  { value: 'cotejo', label: 'Lista de cotejo', icon: '☑️' },
  { value: 'holistica', label: 'Holística', icon: '🎯' },
]

const FONT_OPTIONS = [
  { value: 'arial', label: 'Arial' },
  { value: 'cambria', label: 'Cambria' },
  { value: 'georgia', label: 'Georgia' },
  { value: 'times', label: 'Times New Roman' },
  { value: 'verdana', label: 'Verdana' },
  { value: 'tahoma', label: 'Tahoma' },
  { value: 'trebuchet', label: 'Trebuchet MS' },
  { value: 'courier', label: 'Courier New' },
]
const FONT_FAMILY = {
  arial: 'Arial, Helvetica, sans-serif',
  cambria: 'Cambria, Georgia, serif',
  georgia: 'Georgia, "Times New Roman", serif',
  times: '"Times New Roman", Times, serif',
  verdana: 'Verdana, Geneva, sans-serif',
  tahoma: 'Tahoma, Geneva, sans-serif',
  trebuchet: '"Trebuchet MS", sans-serif',
  courier: '"Courier New", Courier, monospace',
}

const BG_OPTIONS = [
  { value: 'blanco', label: 'Blanco' },
  { value: 'crema', label: 'Crema' },
  { value: 'menta', label: 'Menta' },
]
const BG_CLASS = {
  blanco: 'bg-white',
  crema: 'bg-cream',
  menta: 'bg-mint/10',
}

let nextNivelId = 1
function newNivel(label = '', score = '', color = '#8B7FD6') {
  return { id: nextNivelId++, label, score, color }
}
let nextCriterioId = 1
function newCriterio(name = '', puntaje = '') {
  return { id: nextCriterioId++, name, puntaje, descriptors: {} }
}
let nextItemId = 1
function newItem(name = '') {
  return { id: nextItemId++, name, cumple: null, observacion: '' }
}

const NIVEL_PALETTE = ['#5FB88B', '#4FA8C9', '#E8A33D', '#E0637A', '#8B7FD6', '#C97BC4']

function defaultNiveles() {
  return [
    newNivel('Excelente', '10', NIVEL_PALETTE[0]),
    newNivel('Bueno', '8', NIVEL_PALETTE[1]),
    newNivel('Regular', '6', NIVEL_PALETTE[2]),
    newNivel('Insuficiente', '4', NIVEL_PALETTE[3]),
  ]
}

function defaultCriterios(niveles) {
  const nombres = ['Contenido', 'Organización', 'Creatividad', 'Presentación']
  const ejemploDesc = [
    ['Domina el tema con profundidad y precisión.', 'Comprende el tema con algunos detalles menores.', 'Muestra comprensión parcial del tema.', 'No demuestra comprensión del tema.'],
    ['Ideas ordenadas con secuencia lógica clara.', 'Ideas mayormente ordenadas.', 'Orden confuso en algunos tramos.', 'Sin orden identificable.'],
    ['Propuesta original y bien fundamentada.', 'Propuesta con elementos originales.', 'Propuesta poco original.', 'Sin aporte propio.'],
    ['Presentación cuidada, clara y atractiva.', 'Presentación clara.', 'Presentación con detalles por mejorar.', 'Presentación descuidada.'],
  ]
  return nombres.map((name, i) => {
    const c = newCriterio(name, '25')
    niveles.forEach((n, j) => {
      c.descriptors[n.id] = ejemploDesc[i][j] || ''
    })
    return c
  })
}

function getContrastText(hex) {
  if (!hex) return '#1a1a2e'
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#1a1a2e' : '#ffffff'
}

function normalize(s) {
  return String(s).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export default function Rubricas() {
  const [modo, setModo] = useState('analitica')
  const [font, setFont] = useState('arial')
  const [background, setBackground] = useState('blanco')

  const [title, setTitle] = useState('Rúbrica de evaluación')
  const [showEvaluado, setShowEvaluado] = useState(true)
  const [showCurso, setShowCurso] = useState(true)
  const [showFecha, setShowFecha] = useState(true)
  const [showEvaluador, setShowEvaluador] = useState(true)
  const [evaluadoValue, setEvaluadoValue] = useState('')
  const [cursoValue, setCursoValue] = useState('')
  const [fechaValue, setFechaValue] = useState('')
  const [evaluadorValue, setEvaluadorValue] = useState('')

  const [niveles, setNiveles] = useState(defaultNiveles)
  const [criterios, setCriterios] = useState(() => defaultCriterios(defaultNiveles()))

  const [itemsCotejo, setItemsCotejo] = useState([
    newItem('Cumple con la extensión solicitada'),
    newItem('Presenta las fuentes utilizadas'),
    newItem('Entrega dentro del plazo establecido'),
    newItem('Sigue el formato indicado'),
  ])

  const [holisticaTitulo, setHolisticaTitulo] = useState('Desempeño general')

  const [auriLine, setAuriLine] = useState(null)
  const fileInputRef = useRef(null)

  // ---------- Niveles (analítica / holística) ----------
  function updateNivel(id, field, value) {
    setNiveles((prev) => prev.map((n) => (n.id === id ? { ...n, [field]: value } : n)))
  }
  function addNivel() {
    const idx = niveles.length
    setNiveles((prev) => [...prev, newNivel('', '', NIVEL_PALETTE[idx % NIVEL_PALETTE.length])])
  }
  function removeNivel(id) {
    setNiveles((prev) => prev.filter((n) => n.id !== id))
    setCriterios((prev) =>
      prev.map((c) => {
        const d = { ...c.descriptors }
        delete d[id]
        return { ...c, descriptors: d }
      }),
    )
  }
  function moveNivel(id, direction) {
    setNiveles((prev) => {
      const idx = prev.findIndex((n) => n.id === id)
      const newIdx = idx + direction
      if (idx === -1 || newIdx < 0 || newIdx >= prev.length) return prev
      const copy = [...prev]
      const [item] = copy.splice(idx, 1)
      copy.splice(newIdx, 0, item)
      return copy
    })
  }

  // ---------- Criterios (analítica) ----------
  function updateCriterio(id, field, value) {
    setCriterios((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }
  function updateDescriptor(criterioId, nivelId, value) {
    setCriterios((prev) =>
      prev.map((c) => (c.id === criterioId ? { ...c, descriptors: { ...c.descriptors, [nivelId]: value } } : c)),
    )
  }
  function addCriterio() {
    setCriterios((prev) => [...prev, newCriterio()])
  }
  function removeCriterio(id) {
    setCriterios((prev) => prev.filter((c) => c.id !== id))
  }
  function moveCriterio(id, direction) {
    setCriterios((prev) => {
      const idx = prev.findIndex((c) => c.id === id)
      const newIdx = idx + direction
      if (idx === -1 || newIdx < 0 || newIdx >= prev.length) return prev
      const copy = [...prev]
      const [item] = copy.splice(idx, 1)
      copy.splice(newIdx, 0, item)
      return copy
    })
  }
  const totalPuntaje = criterios.reduce((sum, c) => sum + (parseFloat(c.puntaje) || 0), 0)

  // ---------- Lista de cotejo ----------
  function updateItem(id, field, value) {
    setItemsCotejo((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)))
  }
  function toggleCumple(id, value) {
    setItemsCotejo((prev) => prev.map((it) => (it.id === id ? { ...it, cumple: it.cumple === value ? null : value } : it)))
  }
  function addItem() {
    setItemsCotejo((prev) => [...prev, newItem()])
  }
  function removeItem(id) {
    setItemsCotejo((prev) => prev.filter((it) => it.id !== id))
  }
  function moveItem(id, direction) {
    setItemsCotejo((prev) => {
      const idx = prev.findIndex((it) => it.id === id)
      const newIdx = idx + direction
      if (idx === -1 || newIdx < 0 || newIdx >= prev.length) return prev
      const copy = [...prev]
      const [item] = copy.splice(idx, 1)
      copy.splice(newIdx, 0, item)
      return copy
    })
  }

  function handleLoadExample() {
    const n = defaultNiveles()
    setNiveles(n)
    setCriterios(defaultCriterios(n))
    setItemsCotejo([
      newItem('Cumple con la extensión solicitada'),
      newItem('Presenta las fuentes utilizadas'),
      newItem('Entrega dentro del plazo establecido'),
      newItem('Sigue el formato indicado'),
    ])
  }

  function handleClearAll() {
    if (modo === 'analitica') {
      setCriterios([newCriterio()])
    } else if (modo === 'cotejo') {
      setItemsCotejo([newItem()])
    } else {
      setHolisticaTitulo('')
      setNiveles(niveles.map((n) => ({ ...n, label: '', score: '' })))
    }
  }

  function handlePrint() {
    window.print()
  }

  // ---------- Excel: import y plantilla, formato depende del modo ----------
  async function handleImportExcel(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })
      const body = data.filter((r) => r && r[0] !== undefined && r[0] !== null && String(r[0]).trim() !== '')

      if (modo === 'analitica') {
        const rows = body.filter((r) => normalize(r[0]) !== 'criterio')
        const critByName = new Map()
        const nivByName = new Map()
        const newCrits = []
        const newNivs = []
        let idx = 0
        rows.forEach((r) => {
          const critName = String(r[0] || '').trim()
          const puntaje = String(r[1] || '').trim()
          const nivLabel = String(r[2] || '').trim()
          const desc = String(r[3] || '').trim()
          if (!critName || !nivLabel) return

          let crit = critByName.get(normalize(critName))
          if (!crit) {
            crit = newCriterio(critName, puntaje)
            critByName.set(normalize(critName), crit)
            newCrits.push(crit)
          }
          let niv = nivByName.get(normalize(nivLabel))
          if (!niv) {
            niv = newNivel(nivLabel, '', NIVEL_PALETTE[idx % NIVEL_PALETTE.length])
            idx += 1
            nivByName.set(normalize(nivLabel), niv)
            newNivs.push(niv)
          }
          crit.descriptors[niv.id] = desc
        })
        if (newCrits.length > 0) {
          setNiveles(newNivs)
          setCriterios(newCrits)
          setAuriLine(AURI_LINES[Math.floor(Math.random() * AURI_LINES.length)])
        }
      } else if (modo === 'cotejo') {
        const rows = body.filter((r) => normalize(r[0]) !== 'criterio')
        const parsed = rows.map((r) => newItem(String(r[0] || '').trim())).filter((it) => it.name)
        if (parsed.length > 0) {
          setItemsCotejo(parsed)
          setAuriLine(AURI_LINES[Math.floor(Math.random() * AURI_LINES.length)])
        }
      } else {
        const rows = body.filter((r) => normalize(r[0]) !== 'nivel')
        const parsed = rows
          .map((r, i) => newNivel(String(r[0] || '').trim(), String(r[1] || '').trim(), NIVEL_PALETTE[i % NIVEL_PALETTE.length]))
          .filter((n) => n.label)
        if (parsed.length > 0) {
          setNiveles(parsed)
          setAuriLine(AURI_LINES[Math.floor(Math.random() * AURI_LINES.length)])
        }
      }
    } catch (err) {
      console.error('No se pudo leer el archivo:', err)
    } finally {
      e.target.value = ''
    }
  }

  function handleDownloadTemplate() {
    let worksheet
    if (modo === 'analitica') {
      worksheet = XLSX.utils.aoa_to_sheet([
        ['CRITERIO', 'PUNTAJE', 'NIVEL', 'DESCRIPTOR'],
        ['Contenido', '25', 'Excelente', 'Domina el tema con profundidad.'],
        ['Contenido', '25', 'Bueno', 'Comprende el tema con detalles menores.'],
        ['Organización', '25', 'Excelente', 'Ideas ordenadas con secuencia lógica.'],
      ])
    } else if (modo === 'cotejo') {
      worksheet = XLSX.utils.aoa_to_sheet([
        ['CRITERIO'],
        ['Cumple con la extensión solicitada'],
        ['Presenta las fuentes utilizadas'],
      ])
    } else {
      worksheet = XLSX.utils.aoa_to_sheet([
        ['NIVEL', 'PUNTAJE', 'DESCRIPTOR'],
        ['Excelente', '10', 'El trabajo supera lo esperado en todos los aspectos.'],
        ['Bueno', '8', 'El trabajo cumple con lo esperado.'],
      ])
    }
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rubrica')
    XLSX.writeFile(workbook, `plantilla-rubrica-${modo}.xlsx`)
  }

  const fontFamily = FONT_FAMILY[font]
  const bgClass = BG_CLASS[background]
  const accentColor = niveles[0]?.color || '#8B7FD6'

  return (
    <div className="min-h-screen bg-white dark:bg-deep">
      <style>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
        }
      `}</style>

      <Navbar backHref="#/laboratorio" backLabel="LABORATORIO" />

      <section className="pb-24">
        <PageContainer>
          <div className="text-center mb-6 sm:mb-8 no-print px-2">
            <p className="font-label text-[10px] tracking-widest text-brand mb-4">📊 GENERADOR</p>
            <h1 className="font-display text-3xl sm:text-4xl text-deep font-semibold mb-3 dark:text-cream">Rúbricas</h1>
            <p className="text-deep/70 max-w-md mx-auto text-sm sm:text-base dark:text-cream/70">
              Analítica, lista de cotejo u holística — con tus propios criterios y niveles.
            </p>
          </div>

          <div className="grid lg:grid-cols-[400px_1fr] gap-6 sm:gap-8 items-start">
            <PixelPanel title="MÁQUINA DE RÚBRICAS" icon="📊">
              <PixelField label="Tipo de rúbrica">
                <div className="flex flex-wrap gap-1.5">
                  {MODO_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setModo(opt.value)}
                      className={`flex-1 min-w-[100px] text-xs font-medium py-2 border-2 transition-colors ${
                        modo === opt.value ? 'bg-brand text-white border-brand' : 'bg-white text-deep/60 border-deep/30 hover:border-deep dark:bg-deep dark:text-cream/60 dark:border-cream/30 dark:hover:border-cream'
                      }`}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </PixelField>

              <div className="grid grid-cols-2 gap-2">
                <PixelField label="Tipografía">
                  <select
                    value={font}
                    onChange={(e) => setFont(e.target.value)}
                    className="w-full border-2 border-deep p-1.5 text-xs text-deep bg-white focus:outline-none focus:border-brand dark:text-cream dark:border-cream/40 dark:bg-deep"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </PixelField>
                <PixelField label="Fondo">
                  <select
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="w-full border-2 border-deep p-1.5 text-xs text-deep bg-white focus:outline-none focus:border-brand dark:text-cream dark:border-cream/40 dark:bg-deep"
                  >
                    {BG_OPTIONS.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </PixelField>
              </div>

              {/* Niveles: solo aplica a analítica y holística */}
              {modo !== 'cotejo' && (
                <PixelField label="Niveles de desempeño (elegí cuántos)">
                  <div className="space-y-1.5">
                    {niveles.map((n, i) => (
                      <div key={n.id} className="flex flex-wrap items-center gap-1.5">
                        <input
                          type="color"
                          value={n.color}
                          onChange={(e) => updateNivel(n.id, 'color', e.target.value)}
                          className="w-9 h-9 shrink-0 border-2 border-deep cursor-pointer bg-white p-0.5"
                          aria-label={`Color de ${n.label || 'nivel'}`}
                        />
                        <input
                          type="text"
                          value={n.label}
                          onChange={(e) => updateNivel(n.id, 'label', e.target.value)}
                          placeholder={`Nivel ${i + 1} (ej. Excelente)`}
                          className="flex-1 min-w-[110px] border-2 border-deep p-2 text-sm text-deep focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                        />
                        <input
                          type="text"
                          value={n.score}
                          onChange={(e) => updateNivel(n.id, 'score', e.target.value)}
                          placeholder="pts"
                          className="w-14 shrink-0 border-2 border-deep p-2 text-sm text-deep text-center focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <div className="flex flex-col shrink-0">
                            <button onClick={() => moveNivel(n.id, -1)} disabled={i === 0} className="w-5 h-3.5 flex items-center justify-center text-deep/40 hover:text-brand disabled:opacity-20 leading-none text-[10px]">▲</button>
                            <button onClick={() => moveNivel(n.id, 1)} disabled={i === niveles.length - 1} className="w-5 h-3.5 flex items-center justify-center text-deep/40 hover:text-brand disabled:opacity-20 leading-none text-[10px]">▼</button>
                          </div>
                          <button onClick={() => removeNivel(n.id)} className="shrink-0 w-7 h-7 flex items-center justify-center text-deep/40 hover:text-blossom hover:border-blossom border-2 border-transparent">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <PixelButton variant="ghost" onClick={addNivel}>+ Agregar nivel</PixelButton>
                  </div>
                </PixelField>
              )}

              {/* Título específico para holística */}
              {modo === 'holistica' && (
                <PixelField label="Nombre del aspecto evaluado">
                  <input
                    type="text"
                    value={holisticaTitulo}
                    onChange={(e) => setHolisticaTitulo(e.target.value)}
                    placeholder="ej. Desempeño general del proyecto"
                    className="w-full border-2 border-deep p-2 text-sm text-deep focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                  />
                  <p className="text-xs text-deep/50 mt-1.5">
                    Los descriptores de cada nivel se escriben directo en la hoja, a la derecha →
                  </p>
                </PixelField>
              )}

              {/* Import Excel — común a los 3 modos, formato distinto según modo */}
              <PixelField label={modo === 'analitica' ? 'Criterios (nombre + puntaje)' : modo === 'cotejo' ? 'Ítems a evaluar' : 'Importar niveles'}>
                <div className="flex flex-wrap gap-2 mb-3">
                  <input type="file" ref={fileInputRef} accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportExcel} />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 min-w-[140px] text-xs font-medium text-deep border-2 border-deep py-1.5 bg-white hover:bg-cream transition-colors focus:outline-none dark:text-cream dark:border-cream/40 dark:bg-deep dark:hover:bg-cream/10"
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

                {modo === 'analitica' && (
                  <>
                    <div className="space-y-1.5">
                      {criterios.map((c, i) => (
                        <div key={c.id} className="flex flex-wrap items-center gap-1.5">
                          <input
                            type="text"
                            value={c.name}
                            onChange={(e) => updateCriterio(c.id, 'name', e.target.value)}
                            placeholder={`Criterio ${i + 1}`}
                            className="flex-1 min-w-[130px] border-2 border-deep p-2 text-sm text-deep focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                          />
                          <input
                            type="text"
                            value={c.puntaje}
                            onChange={(e) => updateCriterio(c.id, 'puntaje', e.target.value)}
                            placeholder="pts"
                            className="w-14 shrink-0 border-2 border-deep p-2 text-sm text-deep text-center focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <div className="flex flex-col shrink-0">
                              <button onClick={() => moveCriterio(c.id, -1)} disabled={i === 0} className="w-5 h-3.5 flex items-center justify-center text-deep/40 hover:text-brand disabled:opacity-20 leading-none text-[10px]">▲</button>
                              <button onClick={() => moveCriterio(c.id, 1)} disabled={i === criterios.length - 1} className="w-5 h-3.5 flex items-center justify-center text-deep/40 hover:text-brand disabled:opacity-20 leading-none text-[10px]">▼</button>
                            </div>
                            <button onClick={() => removeCriterio(c.id)} className="shrink-0 w-7 h-7 flex items-center justify-center text-deep/40 hover:text-blossom hover:border-blossom border-2 border-transparent">✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <PixelButton variant="ghost" onClick={addCriterio}>+ Agregar criterio</PixelButton>
                      <span className="text-xs text-deep/50 shrink-0">Total: {totalPuntaje} pts</span>
                    </div>
                    <p className="text-xs text-deep/50 mt-2">
                      Los descriptores de cada casillero se escriben directo en la tabla, a la derecha →
                    </p>
                  </>
                )}

                {modo === 'cotejo' && (
                  <div className="space-y-1.5">
                    {itemsCotejo.map((it, i) => (
                      <div key={it.id} className="flex flex-wrap items-center gap-1.5">
                        <input
                          type="text"
                          value={it.name}
                          onChange={(e) => updateItem(it.id, 'name', e.target.value)}
                          placeholder={`Ítem ${i + 1}`}
                          className="flex-1 min-w-[140px] border-2 border-deep p-2 text-sm text-deep focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <div className="flex flex-col shrink-0">
                            <button onClick={() => moveItem(it.id, -1)} disabled={i === 0} className="w-5 h-3.5 flex items-center justify-center text-deep/40 hover:text-brand disabled:opacity-20 leading-none text-[10px]">▲</button>
                            <button onClick={() => moveItem(it.id, 1)} disabled={i === itemsCotejo.length - 1} className="w-5 h-3.5 flex items-center justify-center text-deep/40 hover:text-brand disabled:opacity-20 leading-none text-[10px]">▼</button>
                          </div>
                          <button onClick={() => removeItem(it.id)} className="shrink-0 w-7 h-7 flex items-center justify-center text-deep/40 hover:text-blossom hover:border-blossom border-2 border-transparent">✕</button>
                        </div>
                      </div>
                    ))}
                    <PixelButton variant="ghost" onClick={addItem}>+ Agregar ítem</PixelButton>
                  </div>
                )}

                {modo === 'holistica' && (
                  <p className="text-xs text-deep/50">
                    Solo necesitás los niveles de arriba — el Excel de esta plantilla trae NIVEL, PUNTAJE y DESCRIPTOR.
                  </p>
                )}

                <div className="flex gap-2 mt-3">
                  <button onClick={handleLoadExample} className="flex-1 text-xs font-medium text-deep/60 border-2 border-dashed border-deep/30 py-1.5 hover:border-deep hover:text-deep hover:bg-white transition-colors focus:outline-none dark:text-cream/60 dark:border-cream/30 dark:hover:bg-cream/10 dark:hover:border-cream dark:hover:text-cream">
                    Cargar ejemplo
                  </button>
                  <button onClick={handleClearAll} className="flex-1 text-xs font-medium text-deep/60 border-2 border-dashed border-deep/30 py-1.5 hover:border-deep hover:text-deep hover:bg-white transition-colors focus:outline-none dark:text-cream/60 dark:border-cream/30 dark:hover:bg-cream/10 dark:hover:border-cream dark:hover:text-cream">
                    Limpiar
                  </button>
                </div>
              </PixelField>

              <PixelField label="Título de la rúbrica">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                  placeholder="Rúbrica de evaluación"
                />
              </PixelField>

              <PixelField label="Datos a completar (se escriben directo en la hoja →)">
                <div className="flex flex-col gap-2">
                  <PixelCheckbox checked={showEvaluado} onChange={(e) => setShowEvaluado(e.target.checked)}>Nombre del evaluado</PixelCheckbox>
                  <PixelCheckbox checked={showCurso} onChange={(e) => setShowCurso(e.target.checked)}>Curso / Grupo</PixelCheckbox>
                  <PixelCheckbox checked={showFecha} onChange={(e) => setShowFecha(e.target.checked)}>Fecha</PixelCheckbox>
                  <PixelCheckbox checked={showEvaluador} onChange={(e) => setShowEvaluador(e.target.checked)}>Nombre del evaluador</PixelCheckbox>
                </div>
              </PixelField>

              <PixelButton variant="secondary" onClick={handlePrint}>
                🖨️ Imprimir / Guardar como PDF
              </PixelButton>

              <AuriNote line={auriLine} />
            </PixelPanel>

            {/* Hoja imprimible */}
            <div className="printable min-w-0">
              <div
                className={`relative border border-deep/70 ${bgClass} overflow-hidden`}
                style={{ fontFamily, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
              >
                <div className="m-2 border border-deep/20">
                  <div className="p-6 sm:p-10">
                    {/* Membrete */}
                    <div className="flex items-start justify-between gap-4 pb-5 mb-6 border-b-2" style={{ borderColor: accentColor }}>
                      <div className="text-left">
                        <p className="font-label text-[8px] tracking-[0.25em] text-deep/40 mb-1.5">
                          {modo === 'analitica' ? 'RÚBRICA ANALÍTICA' : modo === 'cotejo' ? 'LISTA DE COTEJO' : 'RÚBRICA HOLÍSTICA'}
                        </p>
                        <h2 className="font-display text-2xl sm:text-[28px] text-deep font-semibold leading-tight" style={{ fontFamily }}>
                          {title}
                        </h2>
                      </div>
                      <div className="shrink-0 w-14 h-14 rounded-full border-2 flex items-center justify-center" style={{ borderColor: accentColor }}>
                        <span className="text-xl">📊</span>
                      </div>
                    </div>

                    {/* Datos */}
                    {(showEvaluado || showCurso || showFecha || showEvaluador) && (
                      <div className="flex flex-wrap gap-x-10 gap-y-3 mb-8">
                        {showEvaluado && (
                          <div className="flex items-baseline gap-2 flex-1 min-w-[180px]">
                            <span className="font-label text-[8px] tracking-wide text-deep/45 shrink-0">EVALUADO:</span>
                            <input type="text" value={evaluadoValue} onChange={(e) => setEvaluadoValue(e.target.value)} placeholder="_______________________" style={{ fontFamily }} className="flex-1 border-0 bg-transparent px-1 py-0.5 text-sm text-deep placeholder:text-deep/25 focus:outline-none min-w-[120px]" />
                          </div>
                        )}
                        {showCurso && (
                          <div className="flex items-baseline gap-2 min-w-[140px]">
                            <span className="font-label text-[8px] tracking-wide text-deep/45 shrink-0">CURSO:</span>
                            <input type="text" value={cursoValue} onChange={(e) => setCursoValue(e.target.value)} placeholder="__________" style={{ fontFamily }} className="flex-1 border-0 bg-transparent px-1 py-0.5 text-sm text-deep placeholder:text-deep/25 focus:outline-none min-w-[80px]" />
                          </div>
                        )}
                        {showFecha && (
                          <div className="flex items-baseline gap-2 min-w-[140px]">
                            <span className="font-label text-[8px] tracking-wide text-deep/45 shrink-0">FECHA:</span>
                            <input type="text" value={fechaValue} onChange={(e) => setFechaValue(e.target.value)} placeholder="__________" style={{ fontFamily }} className="flex-1 border-0 bg-transparent px-1 py-0.5 text-sm text-deep placeholder:text-deep/25 focus:outline-none min-w-[80px]" />
                          </div>
                        )}
                        {showEvaluador && (
                          <div className="flex items-baseline gap-2 min-w-[160px]">
                            <span className="font-label text-[8px] tracking-wide text-deep/45 shrink-0">EVALUADOR:</span>
                            <input type="text" value={evaluadorValue} onChange={(e) => setEvaluadorValue(e.target.value)} placeholder="_______________________" style={{ fontFamily }} className="flex-1 border-0 bg-transparent px-1 py-0.5 text-sm text-deep placeholder:text-deep/25 focus:outline-none min-w-[100px]" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* ---------- TABLA: ANALÍTICA ---------- */}
                    {modo === 'analitica' && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse table-fixed min-w-[800px]">
                          <colgroup>
                            <col style={{ width: '150px' }} />
                            <col style={{ width: '55px' }} />
                            {niveles.map((n) => (
                              <col key={n.id} />
                            ))}
                          </colgroup>
                          <thead>
                            <tr>
                              <th className="p-2.5 text-[10px] font-label tracking-wide text-white" style={{ backgroundColor: '#1a1a2e' }}>CRITERIO</th>
                              <th className="p-2.5 text-[10px] font-label tracking-wide text-white border-l border-white/10" style={{ backgroundColor: '#1a1a2e' }}>PTS</th>
                              {niveles.map((n) => (
                                <th key={n.id} className="p-2.5 text-[10px] font-label tracking-wide text-white border-l border-white/10" style={{ backgroundColor: '#1a1a2e' }}>
                                  {(n.label || '—').toUpperCase()} {n.score && `(${n.score})`}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {criterios.map((c, rowIdx) => (
                              <tr key={c.id} className={rowIdx % 2 === 1 ? 'bg-black/[0.02]' : ''}>
                                <td className="border border-deep/15 p-2.5 text-[11px] sm:text-xs font-semibold text-deep/80">
                                  {c.name || '—'}
                                </td>
                                <td className="border border-deep/15 p-2.5 text-[11px] text-center text-deep/60">
                                  {c.puntaje || '—'}
                                </td>
                                {niveles.map((n) => (
                                  <td key={n.id} className="border border-deep/15 p-0" style={{ backgroundColor: `${n.color}12` }}>
                                    <textarea
                                      value={c.descriptors[n.id] || ''}
                                      onChange={(e) => updateDescriptor(c.id, n.id, e.target.value)}
                                      placeholder="Descriptor..."
                                      rows={3}
                                      style={{ fontFamily }}
                                      className="w-full h-full min-h-[72px] resize-none border-0 bg-transparent p-2 text-[11px] leading-snug text-deep/85 placeholder:text-deep/25 focus:outline-none focus:bg-white/60"
                                    />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* ---------- TABLA: LISTA DE COTEJO ---------- */}
                    {modo === 'cotejo' && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[600px]">
                          <thead>
                            <tr>
                              <th className="p-2.5 text-[10px] font-label tracking-wide text-white text-left" style={{ backgroundColor: '#1a1a2e' }}>CRITERIO</th>
                              <th className="p-2.5 text-[10px] font-label tracking-wide text-white border-l border-white/10 w-20" style={{ backgroundColor: '#1a1a2e' }}>SÍ</th>
                              <th className="p-2.5 text-[10px] font-label tracking-wide text-white border-l border-white/10 w-20" style={{ backgroundColor: '#1a1a2e' }}>NO</th>
                              <th className="p-2.5 text-[10px] font-label tracking-wide text-white border-l border-white/10" style={{ backgroundColor: '#1a1a2e' }}>OBSERVACIONES</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemsCotejo.map((it, rowIdx) => (
                              <tr key={it.id} className={rowIdx % 2 === 1 ? 'bg-black/[0.02]' : ''}>
                                <td className="border border-deep/15 p-2.5 text-[11px] sm:text-xs font-medium text-deep/80">
                                  {it.name || '—'}
                                </td>
                                <td className="border border-deep/15 p-0 text-center">
                                  <button
                                    onClick={() => toggleCumple(it.id, true)}
                                    className="no-print w-full h-full min-h-[40px] flex items-center justify-center text-lg"
                                  >
                                    {it.cumple === true ? '✅' : '☐'}
                                  </button>
                                  <span className="print-only-flex hidden items-center justify-center min-h-[40px] text-lg">
                                    {it.cumple === true ? '☑' : '☐'}
                                  </span>
                                </td>
                                <td className="border border-deep/15 p-0 text-center">
                                  <button
                                    onClick={() => toggleCumple(it.id, false)}
                                    className="no-print w-full h-full min-h-[40px] flex items-center justify-center text-lg"
                                  >
                                    {it.cumple === false ? '✅' : '☐'}
                                  </button>
                                  <span className="print-only-flex hidden items-center justify-center min-h-[40px] text-lg">
                                    {it.cumple === false ? '☑' : '☐'}
                                  </span>
                                </td>
                                <td className="border border-deep/15 p-1">
                                  <input
                                    type="text"
                                    value={it.observacion}
                                    onChange={(e) => updateItem(it.id, 'observacion', e.target.value)}
                                    placeholder="..."
                                    style={{ fontFamily }}
                                    className="w-full border-0 bg-transparent p-1.5 text-[11px] text-deep/80 placeholder:text-deep/20 focus:outline-none focus:bg-white/60"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* ---------- TABLA: HOLÍSTICA ---------- */}
                    {modo === 'holistica' && (
                      <div>
                        <p className="text-center font-label text-[10px] tracking-wide text-deep/50 mb-4">
                          {holisticaTitulo || 'Desempeño general'}
                        </p>
                        <div className="space-y-2">
                          {niveles.map((n) => (
                            <div key={n.id} className="flex border border-deep/15">
                              <div
                                className="w-32 sm:w-40 shrink-0 flex flex-col items-center justify-center gap-1 p-3 text-center"
                                style={{ backgroundColor: n.color, color: getContrastText(n.color) }}
                              >
                                <span className="text-xs sm:text-sm font-bold">{n.label || '—'}</span>
                                {n.score && <span className="text-[10px] opacity-80">{n.score} pts</span>}
                              </div>
                              <textarea
                                value={n.descriptor || ''}
                                onChange={(e) => updateNivel(n.id, 'descriptor', e.target.value)}
                                placeholder="Describe el desempeño esperado en este nivel..."
                                rows={2}
                                style={{ fontFamily }}
                                className="flex-1 resize-none border-0 bg-transparent p-3 text-[12px] leading-snug text-deep/85 placeholder:text-deep/25 focus:outline-none focus:bg-black/[0.02]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Puntaje total y firma */}
                    <div className="mt-10 flex flex-wrap justify-between gap-8 pt-6">
                      <div className="flex items-baseline gap-2">
                        <span className="font-label text-[9px] tracking-wide text-deep/45">PUNTAJE OBTENIDO:</span>
                        <span className="border-b border-deep/40 min-w-[80px] inline-block">&nbsp;</span>
                        {modo === 'analitica' && totalPuntaje > 0 && (
                          <span className="text-deep/40 text-xs">/ {totalPuntaje} pts</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-[180px] text-center">
                        <div className="border-t border-deep/40 pt-1.5">
                          <p className="text-[10px] text-deep/50">Firma del evaluador</p>
                        </div>
                      </div>
                    </div>

                    <p className="no-print mt-8 text-center text-[9px] tracking-widest text-deep/25 font-label">
                      GENERADO CON AURI KOSMOS
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <Footer />
    </div>
  )
}