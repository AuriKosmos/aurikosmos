// Requiere una dependencia nueva para exportar a PNG:
//   npm install html2canvas
// (se importa de forma dinámica más abajo, solo cuando el usuario exporta)

import { useState, useRef, useMemo, useEffect } from 'react'
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

const BREAK_KEYWORDS = ['recreo', 'receso', 'descanso', 'almuerzo', 'break']
const STORAGE_KEY = 'auri-kosmos-horarios-draft'

let nextSlotId = 1
function newSlot(label = '', isBreak = false) {
  return { id: nextSlotId++, label, isBreak }
}
let nextMateriaId = 1
function newMateria(name = '', color = PALETTE[0]) {
  return { id: nextMateriaId++, name, color }
}

const EXAMPLE_SLOTS = [
  newSlot('07:00 - 07:45'),
  newSlot('07:45 - 08:30'),
  newSlot('08:30 - 09:15'),
  newSlot('09:15 - 09:30', true),
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
  [`${EXAMPLE_SLOTS[0].id}-Lunes`]: { materiaId: EXAMPLE_MATERIAS[0].id, aula: 'Aula 3' },
  [`${EXAMPLE_SLOTS[0].id}-Martes`]: { materiaId: EXAMPLE_MATERIAS[1].id, aula: '' },
  [`${EXAMPLE_SLOTS[1].id}-Lunes`]: { materiaId: EXAMPLE_MATERIAS[1].id, aula: '' },
  [`${EXAMPLE_SLOTS[2].id}-Miércoles`]: { materiaId: EXAMPLE_MATERIAS[2].id, aula: 'Lab' },
  [`${EXAMPLE_SLOTS[5].id}-Viernes`]: { materiaId: EXAMPLE_MATERIAS[3].id, aula: 'Patio' },
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

function slugify(text) {
  const clean = normalize(text).replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '')
  return clean || 'horario'
}

// Extrae minutos totales de etiquetas tipo "07:00 - 07:45". Devuelve null si no matchea el formato.
function parseSlotMinutes(label) {
  const match = String(label || '').match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/)
  if (!match) return null
  const h1 = Number(match[1])
  const m1 = Number(match[2])
  const h2 = Number(match[3])
  const m2 = Number(match[4])
  const start = h1 * 60 + m1
  let end = h2 * 60 + m2
  if (end < start) end += 24 * 60
  return end - start
}

function formatMinutes(total) {
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
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
  const [schedule, setSchedule] = useState(EXAMPLE_SCHEDULE) // { [`${slotId}-${day}`]: { materiaId, aula } }

  const [auriLine, setAuriLine] = useState(null)
  const [importStatus, setImportStatus] = useState(null) // { type: 'success' | 'warning' | 'error', text }
  const [exportStatus, setExportStatus] = useState(null)
  const [confirmingClear, setConfirmingClear] = useState(false)
  const [draftRestored, setDraftRestored] = useState(false)
  const [exportingPng, setExportingPng] = useState(false)
  const fileInputRef = useRef(null)
  const printableRef = useRef(null)

  const dayNames = ALL_DAYS.filter((d) => selectedDays.includes(d))

  // --- Autoguardado: restaurar borrador al montar ---
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const draft = JSON.parse(raw)
      if (!draft || !Array.isArray(draft.slots) || !Array.isArray(draft.materias)) return

      setSlots(draft.slots)
      setMaterias(draft.materias)
      setSchedule(draft.schedule || {})
      if (draft.title) setTitle(draft.title)
      if (typeof draft.showName === 'boolean') setShowName(draft.showName)
      if (typeof draft.showCourse === 'boolean') setShowCourse(draft.showCourse)
      if (typeof draft.showDate === 'boolean') setShowDate(draft.showDate)
      if (draft.audience) setAudience(draft.audience)
      if (Array.isArray(draft.selectedDays) && draft.selectedDays.length > 0) setSelectedDays(draft.selectedDays)
      if (draft.font) setFont(draft.font)
      if (draft.background) setBackground(draft.background)

      const maxSlotId = draft.slots.reduce((max, s) => Math.max(max, s.id || 0), 0)
      const maxMateriaId = draft.materias.reduce((max, m) => Math.max(max, m.id || 0), 0)
      nextSlotId = Math.max(nextSlotId, maxSlotId + 1)
      nextMateriaId = Math.max(nextMateriaId, maxMateriaId + 1)

      setDraftRestored(true)
    } catch (err) {
      console.error('No se pudo restaurar el borrador guardado:', err)
    }
    // Solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Autoguardado: persistir cambios (con debounce simple) ---
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        const draft = {
          slots,
          materias,
          schedule,
          title,
          showName,
          showCourse,
          showDate,
          audience,
          selectedDays,
          font,
          background,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
      } catch (err) {
        console.error('No se pudo guardar el borrador:', err)
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [slots, materias, schedule, title, showName, showCourse, showDate, audience, selectedDays, font, background])

  // Materias que comparten el mismo color, para avisar sin bloquear al usuario.
  const duplicateColorIds = useMemo(() => {
    const byColor = new Map()
    materias.forEach((m) => {
      if (!m.color) return
      byColor.set(m.color, (byColor.get(m.color) || 0) + 1)
    })
    const ids = new Set()
    materias.forEach((m) => {
      if ((byColor.get(m.color) || 0) > 1) ids.add(m.id)
    })
    return ids
  }, [materias])

  // Resumen de horas por materia (suma los bloques con formato "HH:MM - HH:MM").
  const hoursSummary = useMemo(() => {
    const totals = new Map()
    let unparsedCount = 0
    Object.entries(schedule).forEach(([key, cell]) => {
      if (!cell?.materiaId) return
      const slotIdStr = key.split('-')[0]
      const slot = slots.find((s) => String(s.id) === slotIdStr)
      if (!slot || slot.isBreak) return
      const minutes = parseSlotMinutes(slot.label)
      if (minutes == null) {
        unparsedCount += 1
        return
      }
      totals.set(cell.materiaId, (totals.get(cell.materiaId) || 0) + minutes)
    })
    const rows = materias
      .map((m) => ({ id: m.id, name: m.name || '(sin nombre)', color: m.color, minutes: totals.get(m.id) || 0 }))
      .filter((r) => r.minutes > 0)
      .sort((a, b) => b.minutes - a.minutes)
    return { rows, unparsedCount }
  }, [schedule, slots, materias])

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
  function duplicateSlot(id) {
    const newId = nextSlotId++
    setSlots((prev) => {
      const idx = prev.findIndex((s) => s.id === id)
      if (idx === -1) return prev
      const original = prev[idx]
      const copy = { ...original, id: newId, label: original.label ? `${original.label} (copia)` : '' }
      const next = [...prev]
      next.splice(idx + 1, 0, copy)
      return next
    })
    setSchedule((prev) => {
      const copy = { ...prev }
      Object.keys(prev).forEach((key) => {
        if (key.startsWith(`${id}-`)) {
          const day = key.slice(String(id).length + 1)
          copy[`${newId}-${day}`] = prev[key]
        }
      })
      return copy
    })
  }
  function toggleSlotBreak(id) {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, isBreak: !s.isBreak } : s)))
    // Un receso no lleva materias asignadas: limpiamos lo que tuviera cargado.
    setSchedule((prev) => {
      const copy = { ...prev }
      Object.keys(copy).forEach((k) => {
        if (k.startsWith(`${id}-`)) delete copy[k]
      })
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
        if (copy[k]?.materiaId === id) delete copy[k]
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
      const existing = prev[key]
      return { ...prev, [key]: { materiaId, aula: existing?.aula || '' } }
    })
  }
  function setCellAula(slotId, day, aula) {
    setSchedule((prev) => {
      const key = `${slotId}-${day}`
      const existing = prev[key]
      if (!existing && !aula) return prev
      return { ...prev, [key]: { materiaId: existing?.materiaId || null, aula } }
    })
  }

  function handleLoadExample() {
    setSlots(EXAMPLE_SLOTS)
    setMaterias(EXAMPLE_MATERIAS)
    setSchedule(EXAMPLE_SCHEDULE)
    setImportStatus(null)
    setExportStatus(null)
  }

  function handleClearAll() {
    setSlots([newSlot()])
    setMaterias([newMateria()])
    setSchedule({})
    setImportStatus(null)
    setExportStatus(null)
    setConfirmingClear(false)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (err) {
      console.error('No se pudo borrar el borrador guardado:', err)
    }
  }

  function handlePrint() {
    window.print()
  }

  async function handleImportExcel(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportStatus(null)
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
      const unmatchedDays = new Set()
      let skippedRows = 0
      let paletteIdx = 0

      rows.forEach((r) => {
        const dayRaw = String(r[0] || '').trim()
        const label = String(r[1] || '').trim()
        const materiaName = String(r[2] || '').trim()
        const aula = String(r[3] || '').trim()
        if (!label || !materiaName) {
          skippedRows += 1
          return
        }

        const matched = ALL_DAYS.find((d) => normalize(d) === normalize(dayRaw))
        if (!matched) unmatchedDays.add(dayRaw || '(vacío)')
        const matchedDay = matched || dayRaw
        daysFound.add(matchedDay)

        let slot = slotByLabel.get(label)
        if (!slot) {
          slot = newSlot(label)
          slotByLabel.set(label, slot)
          newSlotsList.push(slot)
        }

        const isBreakRow = BREAK_KEYWORDS.includes(normalize(materiaName))
        if (isBreakRow) {
          slot.isBreak = true
          return // los recesos no llevan materia asignada
        }

        let materia = materiaByName.get(normalize(materiaName))
        if (!materia) {
          materia = newMateria(materiaName, PALETTE[paletteIdx % PALETTE.length])
          paletteIdx += 1
          materiaByName.set(normalize(materiaName), materia)
          newMateriasList.push(materia)
        }

        newScheduleMap[`${slot.id}-${matchedDay}`] = { materiaId: materia.id, aula }
      })

      if (newSlotsList.length === 0) {
        setImportStatus({
          type: 'error',
          text: 'No encontré filas válidas en el archivo. Revisa que tenga columnas DIA, BLOQUE, MATERIA y opcionalmente AULA (podés usar la plantilla).',
        })
        return
      }

      setSlots(newSlotsList)
      setMaterias(newMateriasList)
      setSchedule(newScheduleMap)
      const foundDays = ALL_DAYS.filter((d) => daysFound.has(d))
      if (foundDays.length > 0) setSelectedDays(foundDays)
      setAuriLine(AURI_LINES[Math.floor(Math.random() * AURI_LINES.length)])

      if (unmatchedDays.size > 0) {
        setImportStatus({
          type: 'warning',
          text: `Importé todo, pero no reconocí estos días y sus bloques no van a mostrarse: ${Array.from(unmatchedDays).join(', ')}. Usá exactamente Lunes, Martes, Miércoles, Jueves, Viernes, Sábado o Domingo.`,
        })
      } else if (skippedRows > 0) {
        setImportStatus({
          type: 'warning',
          text: `Importado. Salté ${skippedRows} fila(s) sin bloque o sin materia.`,
        })
      } else {
        setImportStatus({ type: 'success', text: 'Horario importado correctamente.' })
      }
    } catch (err) {
      console.error('No se pudo leer el archivo:', err)
      setImportStatus({
        type: 'error',
        text: 'No pude leer ese archivo. Verificá que sea un .xlsx, .xls o .csv válido.',
      })
    } finally {
      e.target.value = ''
    }
  }

  function handleDownloadTemplate() {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['DIA', 'BLOQUE', 'MATERIA', 'AULA'],
      [dayNames[0], '07:00 - 07:45', 'Matemática', 'Aula 3'],
      [dayNames[0], '07:45 - 08:30', 'Lengua', ''],
      [dayNames[0], '09:15 - 09:30', 'Recreo', ''],
      [dayNames[1] || dayNames[0], '07:00 - 07:45', 'Ciencias Naturales', 'Lab'],
    ])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Horario')
    XLSX.writeFile(workbook, 'plantilla-horario.xlsx')
  }

  function handleExportExcel() {
    setExportStatus(null)
    const rows = [['DIA', 'BLOQUE', 'MATERIA', 'AULA']]
    dayNames.forEach((day) => {
      slots.forEach((slot) => {
        if (slot.isBreak) return
        const cell = schedule[`${slot.id}-${day}`]
        if (!cell?.materiaId) return
        const materia = materias.find((m) => m.id === cell.materiaId)
        rows.push([day, slot.label, materia?.name || '', cell.aula || ''])
      })
    })
    if (rows.length === 1) {
      setExportStatus({ type: 'error', text: 'Todavía no hay materias asignadas para exportar.' })
      return
    }
    const worksheet = XLSX.utils.aoa_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Horario')
    XLSX.writeFile(workbook, `${slugify(title)}.xlsx`)
  }

  async function handleExportPng() {
    setExportStatus(null)
    const node = printableRef.current
    if (!node) return
    setExportingPng(true)

    // La tabla puede ser más ancha que el panel y quedar con scroll horizontal.
    // Para que la imagen salga completa (todos los días, no solo lo visible),
    // destrabamos ese scroll y ensanchamos la hoja al ancho real del contenido
    // justo antes de capturar, y lo restauramos apenas termina.
    const scrollWrap = node.querySelector('.overflow-x-auto')
    const prevWrapOverflow = scrollWrap?.style.overflow
    const prevNodeWidth = node.style.width

    try {
      if (scrollWrap) scrollWrap.style.overflow = 'visible'

      const fullContentWidth = scrollWrap ? scrollWrap.scrollWidth : node.scrollWidth
      const computed = window.getComputedStyle(node)
      const paddingX = parseFloat(computed.paddingLeft || '0') + parseFloat(computed.paddingRight || '0')
      const borderX = parseFloat(computed.borderLeftWidth || '0') + parseFloat(computed.borderRightWidth || '0')
      node.style.width = `${fullContentWidth + paddingX + borderX + 2}px`

      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(node, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = `${slugify(title)}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('No se pudo exportar a PNG:', err)
      setExportStatus({
        type: 'error',
        text: 'No pude generar la imagen. Si es la primera vez, revisá que esté instalado "html2canvas" (npm install html2canvas).',
      })
    } finally {
      if (scrollWrap) scrollWrap.style.overflow = prevWrapOverflow || ''
      node.style.width = prevNodeWidth || ''
      setExportingPng(false)
    }
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
        @media (prefers-reduced-motion: reduce) {
          .horarios-cell, .horarios-fade { transition: none !important; animation: none !important; }
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
              {draftRestored && (
                <p className="mb-3 text-[11px] leading-snug text-deep/70 bg-mint/10 border-2 border-mint px-2.5 py-2">
                  📌 Recuperé el horario que tenías guardado en este navegador.
                </p>
              )}

              <div className="grid grid-cols-2 gap-2">
                <PixelField label="Para">
                  <div className="flex gap-1.5">
                    {AUDIENCE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setAudience(opt.value)}
                        className={`flex-1 text-xs font-medium py-1.5 border-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                          audience === opt.value ? 'bg-brand text-white border-brand' : 'bg-white text-deep/60 border-deep/30 hover:border-deep dark:bg-deep dark:text-cream/60 dark:border-cream/30 dark:hover:border-cream'
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
                    className="w-full border-2 border-deep p-1.5 text-xs text-deep bg-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:text-cream dark:border-cream/40 dark:bg-deep"
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
                  className="w-full border-2 border-deep p-2 text-sm text-deep bg-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:text-cream dark:border-cream/40 dark:bg-deep"
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
                        aria-pressed={checked}
                        className={`text-xs font-medium px-2 py-1.5 border-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                          checked ? 'bg-brand text-white border-brand' : 'bg-white text-deep/50 border-deep/30 hover:border-deep dark:bg-deep dark:text-cream/50 dark:border-cream/30 dark:hover:border-cream'
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
                  {materias.map((m) => {
                    const isDuplicate = duplicateColorIds.has(m.id)
                    return (
                      <div key={m.id} className="flex flex-wrap items-center gap-1.5">
                        <div className="relative shrink-0">
                          <input
                            type="color"
                            value={m.color}
                            onChange={(e) => updateMateria(m.id, 'color', e.target.value)}
                            className={`w-9 h-9 border-2 cursor-pointer bg-white p-0.5 ${isDuplicate ? 'border-honey' : 'border-deep'}`}
                            aria-label={`Color de ${m.name || 'materia'}${isDuplicate ? ' (color repetido)' : ''}`}
                          />
                          {isDuplicate && (
                            <span
                              className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-honey border border-deep text-[8px] leading-[13px] text-center text-deep"
                              title="Este color ya lo usa otra materia"
                              aria-hidden="true"
                            >
                              !
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) => updateMateria(m.id, 'name', e.target.value)}
                          placeholder="Nombre de la materia"
                          className="flex-1 min-w-[120px] border-2 border-deep p-2 text-sm text-deep focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                        />
                        <button
                          onClick={() => removeMateria(m.id)}
                          className="shrink-0 w-7 h-7 flex items-center justify-center text-deep/40 hover:text-blossom hover:border-blossom border-2 border-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                          aria-label={`Eliminar ${m.name || 'materia'}`}
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })}
                </div>
                {duplicateColorIds.size > 0 && (
                  <p className="mt-1.5 text-[11px] text-honey">⚠ Hay materias con el mismo color — puede confundirse en la vista impresa.</p>
                )}
                <div className="mt-2">
                  <PixelButton variant="ghost" onClick={addMateria}>
                    + Agregar materia
                  </PixelButton>
                </div>
              </PixelField>

              <PixelField label="Bloques horarios">
                <div className="flex flex-wrap gap-2 mb-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleImportExcel}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 min-w-[140px] text-xs font-medium text-deep border-2 border-deep py-1.5 bg-white hover:bg-cream transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:text-cream dark:border-cream/40 dark:bg-deep dark:hover:bg-cream/10"
                  >
                    📥 Importar desde Excel
                  </button>
                  <button
                    onClick={handleDownloadTemplate}
                    className="shrink-0 text-xs font-medium text-deep/60 border-2 border-dashed border-deep/30 py-1.5 px-3 hover:border-deep hover:text-deep transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    Plantilla
                  </button>
                </div>

                {importStatus && (
                  <div
                    role="status"
                    className={`horarios-fade mb-3 border-2 px-2.5 py-2 text-xs leading-snug ${
                      importStatus.type === 'error'
                        ? 'border-blossom text-blossom bg-blossom/5'
                        : importStatus.type === 'warning'
                        ? 'border-honey text-honey-dark bg-honey/10'
                        : 'border-mint text-deep bg-mint/10'
                    }`}
                  >
                    {importStatus.type === 'error' ? '✕ ' : importStatus.type === 'warning' ? '⚠ ' : '✓ '}
                    {importStatus.text}
                  </div>
                )}

                <p className="text-[11px] text-deep/50 mb-2">
                  Tip: escribí los bloques como "07:00 - 07:45" para que el resumen de horas los pueda sumar, y marcá los recreos con el check de abajo.
                </p>

                <div className="space-y-2">
                  {slots.map((slot, i) => (
                    <div key={slot.id} className="border-2 border-deep/10 p-1.5 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <input
                          type="text"
                          value={slot.label}
                          onChange={(e) => updateSlot(slot.id, e.target.value)}
                          placeholder={`BLOQUE ${i + 1} (ej. 07:00 - 07:45)`}
                          className="flex-1 min-w-[140px] border-2 border-deep p-2 text-sm text-deep focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
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
                            onClick={() => duplicateSlot(slot.id)}
                            className="shrink-0 w-7 h-7 flex items-center justify-center text-deep/40 hover:text-brand border-2 border-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                            aria-label={`Duplicar bloque ${i + 1}`}
                            title="Duplicar bloque"
                          >
                            ⧉
                          </button>
                          <button
                            onClick={() => removeSlot(slot.id)}
                            className="shrink-0 w-7 h-7 flex items-center justify-center text-deep/40 hover:text-blossom hover:border-blossom border-2 border-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                            aria-label={`Eliminar bloque ${i + 1}`}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <PixelCheckbox checked={!!slot.isBreak} onChange={() => toggleSlotBreak(slot.id)}>
                        Es receso / recreo (sin materia)
                      </PixelCheckbox>
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
                    className="flex-1 text-xs font-medium text-deep/60 border-2 border-dashed border-deep/30 py-1.5 hover:border-deep hover:text-deep hover:bg-white transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:text-cream/60 dark:border-cream/30 dark:hover:bg-cream/10 dark:hover:border-cream dark:hover:text-cream"
                  >
                    Cargar ejemplo
                  </button>

                  {confirmingClear ? (
                    <div className="flex-1 flex items-center gap-1">
                      <button
                        onClick={handleClearAll}
                        className="flex-1 text-xs font-medium text-white bg-blossom border-2 border-blossom py-1.5 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        ¿Seguro? Sí, borrar
                      </button>
                      <button
                        onClick={() => setConfirmingClear(false)}
                        className="text-xs font-medium text-deep/60 border-2 border-dashed border-deep/30 py-1.5 px-2 hover:border-deep hover:text-deep transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingClear(true)}
                      className="flex-1 text-xs font-medium text-deep/60 border-2 border-dashed border-deep/30 py-1.5 hover:border-blossom hover:text-blossom hover:bg-white transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:text-cream/60 dark:border-cream/30 dark:hover:bg-cream/10"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </PixelField>

              <PixelField label="Resumen de horas por materia">
                {hoursSummary.rows.length === 0 ? (
                  <p className="text-xs text-deep/50">Todavía no hay materias asignadas al horario.</p>
                ) : (
                  <div className="space-y-1">
                    {hoursSummary.rows.map((r) => (
                      <div key={r.id} className="flex items-center gap-2 text-xs">
                        <span className="w-3 h-3 border border-deep/30 shrink-0" style={{ backgroundColor: r.color }} />
                        <span className="flex-1 text-deep/80 truncate">{r.name}</span>
                        <span className="font-medium text-deep">{formatMinutes(r.minutes)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {hoursSummary.unparsedCount > 0 && (
                  <p className="mt-1.5 text-[11px] text-deep/40">
                    {hoursSummary.unparsedCount} bloque(s) no tienen el formato "HH:MM - HH:MM", así que no se sumaron.
                  </p>
                )}
              </PixelField>

              <PixelField label="Título de la hoja">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
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

              {exportStatus && (
                <div
                  role="status"
                  className={`horarios-fade mb-3 border-2 px-2.5 py-2 text-xs leading-snug ${
                    exportStatus.type === 'error' ? 'border-blossom text-blossom bg-blossom/5' : 'border-mint text-deep bg-mint/10'
                  }`}
                >
                  {exportStatus.type === 'error' ? '✕ ' : '✓ '}
                  {exportStatus.text}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={handleExportExcel}
                  className="text-xs font-medium text-deep border-2 border-deep py-1.5 bg-white hover:bg-cream transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:text-cream dark:border-cream/40 dark:bg-deep dark:hover:bg-cream/10"
                >
                  📊 Exportar a Excel
                </button>
                <button
                  onClick={handleExportPng}
                  disabled={exportingPng}
                  className="text-xs font-medium text-deep border-2 border-deep py-1.5 bg-white hover:bg-cream transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 dark:text-cream dark:border-cream/40 dark:bg-deep dark:hover:bg-cream/10"
                >
                  {exportingPng ? 'Generando…' : '🖼️ Exportar a PNG'}
                </button>
              </div>

              <PixelButton variant="secondary" onClick={handlePrint}>
                🖨️ Imprimir / Guardar como PDF
              </PixelButton>

              <AuriNote line={auriLine} />
            </PixelPanel>

            {/* Resultado / Hoja imprimible */}
            <div className="printable min-w-0">
              {slots.length === 0 && <EmptyPreview>Tu horario va a aparecer aquí. Agregá un bloque para empezar.</EmptyPreview>}

              {slots.length > 0 && (
                <div
                  ref={printableRef}
                  className={`border-2 border-deep p-4 sm:p-8 shadow-[4px_4px_0_0_rgba(27,30,58,0.08)] ${bgClass}`}
                  style={{ fontFamily, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                >
                  {/* Encabezado editable directo sobre la hoja */}
                  <div className="mb-6 text-center">
                    <h2 className="font-display text-2xl sm:text-3xl text-deep font-semibold" style={{ fontFamily }}>
                      {title || 'Horario de clases'}
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
                            {slot.isBreak ? (
                              <td colSpan={dayNames.length || 1} className="border border-deep p-0">
                                <div className="min-h-[40px] w-full h-full flex items-center justify-center text-center text-[11px] font-label tracking-wide text-deep/70 bg-honey/10 bg-[repeating-linear-gradient(135deg,_rgba(27,30,58,0.10)_0px,_rgba(27,30,58,0.10)_6px,_transparent_6px,_transparent_14px)]">
                                  {/* Si el bloque ya es un rango horario (ej. "09:15 - 09:30"), no repetimos la hora acá (ya se ve a la izquierda) — mostramos solo "RECESO". Si el docente escribió un texto propio (ej. "Almuerzo"), lo respetamos. */}
                                  {parseSlotMinutes(slot.label) != null ? 'RECESO' : slot.label ? slot.label.toUpperCase() : 'RECESO'}
                                </div>
                              </td>
                            ) : (
                              dayNames.map((day) => {
                                const key = `${slot.id}-${day}`
                                const cell = schedule[key]
                                const materia = cell?.materiaId ? materias.find((m) => m.id === cell.materiaId) : null
                                return (
                                  <td key={day} className="relative border border-deep p-0">
                                    {/* Celda visual: siempre muestra el nombre completo y el aula, sin recortar */}
                                    <div
                                      className="horarios-cell min-h-[52px] w-full h-full flex flex-col items-center justify-center text-center p-1.5 text-xs sm:text-sm leading-tight break-words transition-colors duration-150"
                                      style={{
                                        backgroundColor: materia ? materia.color : 'transparent',
                                        color: materia ? getContrastText(materia.color) : '#1a1a2e',
                                        fontFamily,
                                      }}
                                    >
                                      <span>{materia ? materia.name || '(sin nombre)' : '—'}</span>
                                      {cell?.aula && <span className="text-[10px] opacity-80 mt-0.5">{cell.aula}</span>}
                                    </div>
                                    {/* Selector invisible superpuesto en 2/3 superiores: elige la materia con un clic */}
                                    <select
                                      value={cell?.materiaId || ''}
                                      onChange={(e) => setCell(slot.id, day, e.target.value ? Number(e.target.value) : null)}
                                      className="no-print absolute inset-x-0 top-0 h-2/3 w-full cursor-pointer opacity-0 focus-visible:opacity-100 focus-visible:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                                      aria-label={`Materia para ${day}, bloque ${slot.label || 'sin nombre'}${materia ? ` (actual: ${materia.name || 'sin nombre'})` : ''}`}
                                    >
                                      <option value="">—</option>
                                      {materias.map((m) => (
                                        <option key={m.id} value={m.id}>
                                          {m.name || '(sin nombre)'}
                                        </option>
                                      ))}
                                    </select>
                                    {/* Input invisible en el tercio inferior: aparece al pasar el mouse o enfocar, para escribir el aula */}
                                    <input
                                      type="text"
                                      value={cell?.aula || ''}
                                      onChange={(ev) => setCellAula(slot.id, day, ev.target.value)}
                                      placeholder="Aula"
                                      className="no-print absolute inset-x-0 bottom-0 h-1/3 w-full text-[10px] text-center bg-white/95 border-t border-deep/20 text-deep opacity-0 hover:opacity-100 focus:opacity-100 focus:outline-none px-1"
                                      aria-label={`Aula para ${day}, bloque ${slot.label || 'sin nombre'}`}
                                    />
                                  </td>
                                )
                              })
                            )}
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