import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { PixelButton, PixelCheckbox } from '../../../components/ui'
import { AuriNote } from '../../../components/auri'
import { PixelPanel, PixelField, EmptyPreview } from '../components'
import { Navbar, Footer, PageContainer } from '../../../components/layout'

const AURI_LINES = ['Quedó ordenado.', 'Así se ve mejor.', '¿Otro color?', 'Buen horario.']

const ALL_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const DEFAULT_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const AUDIENCE_OPTIONS = [
  { value: 'docente', label: 'Docente' },
  { value: 'estudiante', label: 'Estudiante' },
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
  { value: 'comic', label: 'Comic Sans MS' },
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
  comic: '"Comic Sans MS", "Comic Sans", cursive',
}

const BG_OPTIONS = [
  { value: 'blanco', label: 'Blanco' },
  { value: 'crema', label: 'Crema' },
  { value: 'menta', label: 'Menta' },
  { value: 'pixel', label: 'Pixel Art' },
  { value: 'rayas', label: 'Rayas' },
]
const BG_CLASS = {
  blanco: 'bg-white',
  crema: 'bg-cream',
  menta: 'bg-mint/10',
  pixel: 'bg-white bg-[radial-gradient(circle,_rgba(0,0,0,0.06)_1.5px,_transparent_1.5px)] bg-[length:10px_10px]',
  rayas: 'bg-white bg-[repeating-linear-gradient(135deg,_rgba(0,0,0,0.04)_0px,_rgba(0,0,0,0.04)_2px,_transparent_2px,_transparent_10px)]',
}

const PALETTE = ['#8B7FD6', '#5FB88B', '#E8A33D', '#E0637A', '#4FA8C9', '#C97BC4', '#7C9A4C', '#D97748', '#5B7FBF', '#B8865C']

let nextSlotId = 1
function newSlot(label = '') {
  return { id: nextSlotId++, label }
}
let nextMateriaId = 1
function newMateria(name = '', color = PALETTE[0]) {
  return { id: nextMateriaId++, name, color }
}

const EXAMPLE_SLOTS = [
  newSlot('07:00 - 07:45'),
  newSlot('07:45 - 08:30'),
  newSlot('08:30 - 09:15'),
  newSlot('09:15 - 09:30 (Recreo)'),
  newSlot('09:30 - 10:15'),
  newSlot('10:15 - 11:00'),
]

const EXAMPLE_MATERIAS = [
  newMateria('Matemática', PALETTE[0]),
  newMateria('Lengua y Literatura', PALETTE[1]),
  newMateria('Ciencias Naturales', PALETTE[2]),
  newMateria('Educación Física', PALETTE[3]),
]

const EXAMPLE_SCHEDULE = {
  [`${EXAMPLE_SLOTS[0].id}-Lunes`]: EXAMPLE_MATERIAS[0].id,
  [`${EXAMPLE_SLOTS[0].id}-Martes`]: EXAMPLE_MATERIAS[1].id,
  [`${EXAMPLE_SLOTS[1].id}-Lunes`]: EXAMPLE_MATERIAS[1].id,
  [`${EXAMPLE_SLOTS[2].id}-Miércoles`]: EXAMPLE_MATERIAS[2].id,
  [`${EXAMPLE_SLOTS[5].id}-Viernes`]: EXAMPLE_MATERIAS[3].id,
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

export default function Horarios() {
  const [audience, setAudience] = useState('docente')
  const [selectedDays, setSelectedDays] = useState(DEFAULT_DAYS)
  const [font, setFont] = useState('arial')
  const [background, setBackground] = useState('blanco')

  const [title, setTitle] = useState('Horario de clases')
  const [showName, setShowName] = useState(true)
  const [showCourse, setShowCourse] = useState(true)
  const [showDate, setShowDate] = useState(false)

  // Estos son los que se escriben directo sobre la hoja imprimible.
  const [nameValue, setNameValue] = useState('')
  const [courseValue, setCourseValue] = useState('')
  const [dateValue, setDateValue] = useState('')

  const [slots, setSlots] = useState(EXAMPLE_SLOTS)
  const [materias, setMaterias] = useState(EXAMPLE_MATERIAS)
  const [schedule, setSchedule] = useState(EXAMPLE_SCHEDULE)

  const [auriLine, setAuriLine] = useState(null)
  const fileInputRef = useRef(null)

  const dayNames = ALL_DAYS.filter((d) => selectedDays.includes(d))

  function toggleDay(day) {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        if (prev.length === 1) return prev // siempre debe quedar al menos un día
        return prev.filter((d) => d !== day)
      }
      return [...prev, day]
    })
  }

  function updateSlot(id, value) {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, label: value } : s)))
  }
  function addSlot() {
    setSlots((prev) => [...prev, newSlot()])
  }
  function removeSlot(id) {
    setSlots((prev) => prev.filter((s) => s.id !== id))
    setSchedule((prev) => {
      const copy = { ...prev }
      Object.keys(copy).forEach((k) => {
        if (k.startsWith(`${id}-`)) delete copy[k]
      })
      return copy
    })
  }
  function moveSlot(id, direction) {
    setSlots((prev) => {
      const idx = prev.findIndex((s) => s.id === id)
      const newIdx = idx + direction
      if (idx === -1 || newIdx < 0 || newIdx >= prev.length) return prev
      const copy = [...prev]
      const [item] = copy.splice(idx, 1)
      copy.splice(newIdx, 0, item)
      return copy
    })
  }

  function updateMateria(id, field, value) {
    setMaterias((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
  }
  function addMateria() {
    const usedColors = materias.map((m) => m.color)
    const nextColor = PALETTE.find((c) => !usedColors.includes(c)) || PALETTE[materias.length % PALETTE.length]
    setMaterias((prev) => [...prev, newMateria('', nextColor)])
  }
  function removeMateria(id) {
    setMaterias((prev) => prev.filter((m) => m.id !== id))
    setSchedule((prev) => {
      const copy = { ...prev }
      Object.keys(copy).forEach((k) => {
        if (copy[k] === id) delete copy[k]
      })
      return copy
    })
  }

  function setCell(slotId, day, materiaId) {
    setSchedule((prev) => {
      const key = `${slotId}-${day}`
      if (!materiaId) {
        const copy = { ...prev }
        delete copy[key]
        return copy
      }
      return { ...prev, [key]: materiaId }
    })
  }

  function handleLoadExample() {
    setSlots(EXAMPLE_SLOTS)
    setMaterias(EXAMPLE_MATERIAS)
    setSchedule(EXAMPLE_SCHEDULE)
  }

  function handleClearAll() {
    setSlots([newSlot()])
    setMaterias([newMateria()])
    setSchedule({})
  }

  function handlePrint() {
    window.print()
  }

  async function handleImportExcel(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })

      const body = data.filter((r) => r && r[0] !== undefined && r[0] !== null && String(r[0]).trim() !== '')
      const rows = body.filter((r) => normalize(r[0]) !== 'dia')

      const newSlotsList = []
      const slotByLabel = new Map()
      const newMateriasList = []
      const materiaByName = new Map()
      const newScheduleMap = {}
      const daysFound = new Set()
      let paletteIdx = 0

      rows.forEach((r) => {
        const dayRaw = String(r[0] || '').trim()
        const label = String(r[1] || '').trim()
        const materiaName = String(r[2] || '').trim()
        if (!label || !materiaName) return

        const matchedDay = ALL_DAYS.find((d) => normalize(d) === normalize(dayRaw)) || dayRaw
        daysFound.add(matchedDay)

        let slot = slotByLabel.get(label)
        if (!slot) {
          slot = newSlot(label)
          slotByLabel.set(label, slot)
          newSlotsList.push(slot)
        }

        let materia = materiaByName.get(normalize(materiaName))
        if (!materia) {
          materia = newMateria(materiaName, PALETTE[paletteIdx % PALETTE.length])
          paletteIdx += 1
          materiaByName.set(normalize(materiaName), materia)
          newMateriasList.push(materia)
        }

        newScheduleMap[`${slot.id}-${matchedDay}`] = materia.id
      })

      if (newSlotsList.length > 0) {
        setSlots(newSlotsList)
        setMaterias(newMateriasList)
        setSchedule(newScheduleMap)
        const foundDays = ALL_DAYS.filter((d) => daysFound.has(d))
        if (foundDays.length > 0) setSelectedDays(foundDays)
        setAuriLine(AURI_LINES[Math.floor(Math.random() * AURI_LINES.length)])
      }
    } catch (err) {
      console.error('No se pudo leer el archivo:', err)
    } finally {
      e.target.value = ''
    }
  }

  function handleDownloadTemplate() {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['DIA', 'BLOQUE', 'MATERIA'],
      [dayNames[0], '07:00 - 07:45', 'Matemática'],
      [dayNames[0], '07:45 - 08:30', 'Lengua'],
      [dayNames[1] || dayNames[0], '07:00 - 07:45', 'Ciencias Naturales'],
    ])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Horario')
    XLSX.writeFile(workbook, 'plantilla-horario.xlsx')
  }

  const fontFamily = FONT_FAMILY[font]
  const bgClass = BG_CLASS[background]

  return (
    <div className="min-h-screen bg-white">
      {/* Fuerza horizontal SOLO al imprimir esta pantalla */}
      <style>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
        }
      `}</style>

      <Navbar backHref="#/laboratorio" backLabel="LABORATORIO" />

      <section className="pb-24">
        <PageContainer>
          <div className="text-center mb-6 sm:mb-8 no-print px-2">
            <p className="font-label text-[10px] tracking-widest text-brand mb-4">🗓️ GENERADOR</p>
            <h1 className="font-display text-3xl sm:text-4xl text-deep font-semibold mb-3">Horarios</h1>
            <p className="text-deep/70 max-w-md mx-auto text-sm sm:text-base">
              Armá el horario con colores por materia, tu tipografía y diseño favoritos.
            </p>
          </div>

          <div className="grid lg:grid-cols-[380px_1fr] gap-6 sm:gap-8 items-start">
            <PixelPanel title="MÁQUINA DE HORARIOS" icon="🗓️">
              <div className="grid grid-cols-2 gap-2">
                <PixelField label="Para">
                  <div className="flex gap-1.5">
                    {AUDIENCE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setAudience(opt.value)}
                        className={`flex-1 text-xs font-medium py-1.5 border-2 transition-colors ${
                          audience === opt.value ? 'bg-brand text-white border-brand' : 'bg-white text-deep/60 border-deep/30 hover:border-deep'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </PixelField>
                <PixelField label="Fondo">
                  <select
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="w-full border-2 border-deep p-1.5 text-xs text-deep bg-white focus:outline-none focus:border-brand"
                  >
                    {BG_OPTIONS.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </PixelField>
              </div>

              <PixelField label="Tipografía">
                <select
                  value={font}
                  onChange={(e) => setFont(e.target.value)}
                  className="w-full border-2 border-deep p-2 text-sm text-deep bg-white focus:outline-none focus:border-brand"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value} style={{ fontFamily: FONT_FAMILY[f.value] }}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </PixelField>

              <PixelField label="Días a mostrar">
                <div className="flex flex-wrap gap-1.5">
                  {ALL_DAYS.map((day) => {
                    const checked = selectedDays.includes(day)
                    return (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`text-xs font-medium px-2 py-1.5 border-2 transition-colors ${
                          checked ? 'bg-brand text-white border-brand' : 'bg-white text-deep/50 border-deep/30 hover:border-deep'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    )
                  })}
                </div>
              </PixelField>

              <PixelField label="Materias y colores">
                <div className="space-y-2">
                  {materias.map((m) => (
                    <div key={m.id} className="flex flex-wrap items-center gap-1.5">
                      <input
                        type="color"
                        value={m.color}
                        onChange={(e) => updateMateria(m.id, 'color', e.target.value)}
                        className="w-9 h-9 shrink-0 border-2 border-deep cursor-pointer bg-white p-0.5"
                        aria-label={`Color de ${m.name || 'materia'}`}
                      />
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => updateMateria(m.id, 'name', e.target.value)}
                        placeholder="Nombre de la materia"
                        className="flex-1 min-w-[120px] border-2 border-deep p-2 text-sm text-deep focus:outline-none focus:border-brand bg-white"
                      />
                      <button
                        onClick={() => removeMateria(m.id)}
                        className="shrink-0 w-7 h-7 flex items-center justify-center text-deep/40 hover:text-blossom hover:border-blossom border-2 border-transparent"
                        aria-label={`Eliminar ${m.name || 'materia'}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <PixelButton variant="ghost" onClick={addMateria}>
                    + Agregar materia
                  </PixelButton>
                </div>
              </PixelField>

              <PixelField label="Bloques horarios">
                <div className="flex flex-wrap gap-2 mb-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleImportExcel}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 min-w-[140px] text-xs font-medium text-deep border-2 border-deep py-1.5 bg-white hover:bg-cream transition-colors focus:outline-none"
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

                <div className="space-y-1.5">
                  {slots.map((slot, i) => (
                    <div key={slot.id} className="flex flex-wrap items-center gap-1.5">
                      <input
                        type="text"
                        value={slot.label}
                        onChange={(e) => updateSlot(slot.id, e.target.value)}
                        placeholder={`BLOQUE ${i + 1} (ej. 07:00 - 07:45)`}
                        className="flex-1 min-w-[140px] border-2 border-deep p-2 text-sm text-deep focus:outline-none focus:border-brand bg-white"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <div className="flex flex-col shrink-0">
                          <button
                            onClick={() => moveSlot(slot.id, -1)}
                            disabled={i === 0}
                            className="w-5 h-3.5 flex items-center justify-center text-deep/40 hover:text-brand disabled:opacity-20 disabled:hover:text-deep/40 leading-none text-[10px]"
                            aria-label={`Subir bloque ${i + 1}`}
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveSlot(slot.id, 1)}
                            disabled={i === slots.length - 1}
                            className="w-5 h-3.5 flex items-center justify-center text-deep/40 hover:text-brand disabled:opacity-20 disabled:hover:text-deep/40 leading-none text-[10px]"
                            aria-label={`Bajar bloque ${i + 1}`}
                          >
                            ▼
                          </button>
                        </div>
                        <button
                          onClick={() => removeSlot(slot.id)}
                          className="shrink-0 w-7 h-7 flex items-center justify-center text-deep/40 hover:text-blossom hover:border-blossom border-2 border-transparent"
                          aria-label={`Eliminar bloque ${i + 1}`}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <PixelButton variant="ghost" onClick={addSlot}>
                    + Agregar bloque
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
                  placeholder="Horario de clases"
                />
              </PixelField>

              <PixelField label="Datos que aparecen en la hoja (se escriben directo ahí →)">
                <div className="flex flex-col gap-2">
                  <PixelCheckbox checked={showName} onChange={(e) => setShowName(e.target.checked)}>
                    {audience === 'docente' ? 'Nombre del docente' : 'Nombre del estudiante'}
                  </PixelCheckbox>
                  <PixelCheckbox checked={showCourse} onChange={(e) => setShowCourse(e.target.checked)}>
                    Curso / Paralelo
                  </PixelCheckbox>
                  <PixelCheckbox checked={showDate} onChange={(e) => setShowDate(e.target.checked)}>
                    Fecha / Período
                  </PixelCheckbox>
                </div>
              </PixelField>

              <PixelButton variant="secondary" onClick={handlePrint}>
                🖨️ Imprimir / Guardar como PDF
              </PixelButton>

              <AuriNote line={auriLine} />
            </PixelPanel>

            {/* Resultado / Hoja imprimible */}
            <div className="printable min-w-0">
              {slots.length === 0 && <EmptyPreview>Tu horario va a aparecer aquí.</EmptyPreview>}

              {slots.length > 0 && (
                <div
                  className={`border-2 border-deep p-4 sm:p-8 ${bgClass}`}
                  style={{ fontFamily, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                >
                  {/* Encabezado editable directo sobre la hoja */}
                  <div className="mb-6 text-center">
                    <h2 className="font-display text-2xl sm:text-3xl text-deep font-semibold" style={{ fontFamily }}>
                      {title}
                    </h2>
                    {(showName || showCourse || showDate) && (
                      <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-2">
                        {showName && (
                          <div className="flex items-center gap-2">
                            <span className="font-label text-[9px] tracking-wide text-deep/50 shrink-0">
                              {audience === 'docente' ? 'DOCENTE' : 'ESTUDIANTE'}
                            </span>
                            <input
                              type="text"
                              value={nameValue}
                              onChange={(e) => setNameValue(e.target.value)}
                              placeholder="Escribe aquí..."
                              style={{ fontFamily }}
                              className="border-0 border-b-2 border-deep/40 bg-transparent px-1 py-0.5 text-sm text-deep placeholder:text-deep/30 focus:outline-none focus:border-brand min-w-[160px]"
                            />
                          </div>
                        )}
                        {showCourse && (
                          <div className="flex items-center gap-2">
                            <span className="font-label text-[9px] tracking-wide text-deep/50 shrink-0">CURSO</span>
                            <input
                              type="text"
                              value={courseValue}
                              onChange={(e) => setCourseValue(e.target.value)}
                              placeholder="Escribe aquí..."
                              style={{ fontFamily }}
                              className="border-0 border-b-2 border-deep/40 bg-transparent px-1 py-0.5 text-sm text-deep placeholder:text-deep/30 focus:outline-none focus:border-brand min-w-[140px]"
                            />
                          </div>
                        )}
                        {showDate && (
                          <div className="flex items-center gap-2">
                            <span className="font-label text-[9px] tracking-wide text-deep/50 shrink-0">FECHA</span>
                            <input
                              type="text"
                              value={dateValue}
                              onChange={(e) => setDateValue(e.target.value)}
                              placeholder="Escribe aquí..."
                              style={{ fontFamily }}
                              className="border-0 border-b-2 border-deep/40 bg-transparent px-1 py-0.5 text-sm text-deep placeholder:text-deep/30 focus:outline-none focus:border-brand min-w-[120px]"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse table-fixed min-w-[700px]">
                      <colgroup>
                        <col style={{ width: '130px' }} />
                        {dayNames.map((d) => (
                          <col key={d} />
                        ))}
                      </colgroup>
                      <thead>
                        <tr>
                          <th className="border border-deep p-2 text-xs font-label text-deep/60 bg-white/60">
                            BLOQUE
                          </th>
                          {dayNames.map((day) => (
                            <th
                              key={day}
                              className="border border-deep p-2 text-xs font-label text-deep/60 bg-white/60"
                            >
                              {day.toUpperCase()}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {slots.map((slot) => (
                          <tr key={slot.id}>
                            <td className="border border-deep p-2 text-xs font-medium text-deep bg-white/60">
                              {slot.label || '—'}
                            </td>
                            {dayNames.map((day) => {
                              const key = `${slot.id}-${day}`
                              const materiaId = schedule[key] || ''
                              const materia = materias.find((m) => m.id === materiaId)
                              return (
                                <td key={day} className="relative border border-deep p-0">
                                  {/* Celda visual: siempre muestra el nombre completo, sin recortar */}
                                  <div
                                    className="min-h-[52px] w-full h-full flex items-center justify-center text-center p-1.5 text-xs sm:text-sm leading-tight break-words"
                                    style={{
                                      backgroundColor: materia ? materia.color : 'transparent',
                                      color: materia ? getContrastText(materia.color) : '#1a1a2e',
                                      fontFamily,
                                    }}
                                  >
                                    {materia ? materia.name || '(sin nombre)' : '—'}
                                  </div>
                                  {/* Selector invisible superpuesto: hace el clic funcionar */}
                                  <select
                                    value={materiaId}
                                    onChange={(e) => setCell(slot.id, day, e.target.value ? Number(e.target.value) : null)}
                                    className="no-print absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    aria-label={`Materia para ${day}, bloque ${slot.label}`}
                                  >
                                    <option value="">—</option>
                                    {materias.map((m) => (
                                      <option key={m.id} value={m.id}>
                                        {m.name || '(sin nombre)'}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {materias.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-3">
                      {materias.map((m) => (
                        <div key={m.id} className="flex items-center gap-1.5">
                          <span
                            className="w-3.5 h-3.5 border border-deep/30 shrink-0"
                            style={{ backgroundColor: m.color }}
                          />
                          <span className="text-xs text-deep/70">{m.name || '(sin nombre)'}</span>
                        </div>
                      ))}
                    </div>
                  )}
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