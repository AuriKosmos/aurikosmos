import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { PixelButton, PixelCheckbox } from '../../../components/ui'
import { AuriNote } from '../../../components/auri'
import { PixelPanel, PixelField, EmptyPreview } from '../components'
import { Navbar, Footer, PageContainer } from '../../../components/layout'

const AURI_LINES = ['Quedó bien planificado.', 'Buena secuencia.', '¿Ajustamos los tiempos?', 'Así se prepara una clase.']

const MODO_OPTIONS = [
  { value: 'clase', label: 'Plan de clase', icon: '📝' },
  { value: 'unidad', label: 'Plan de unidad', icon: '🗂️' },
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

const MOMENTO_OPTIONS = ['Inicio', 'Desarrollo', 'Cierre']

let nextMomentoId = 1
function newMomento(momento = 'Inicio', actividad = '', tiempo = '', recursos = '') {
  return { id: nextMomentoId++, momento, actividad, tiempo, recursos }
}
let nextSesionId = 1
function newSesion(sesion = '', contenido = '', destreza = '', actividades = '', recursos = '', evaluacion = '') {
  return { id: nextSesionId++, sesion, contenido, destreza, actividades, recursos, evaluacion }
}

function defaultMomentos() {
  return [
    newMomento('Inicio', 'Activación de conocimientos previos con una pregunta generadora.', '10 min', 'Pizarra, proyector'),
    newMomento('Desarrollo', 'Explicación del tema y trabajo guiado en parejas.', '25 min', 'Guía impresa, cuaderno'),
    newMomento('Cierre', 'Puesta en común y retroalimentación grupal.', '10 min', 'Ninguno'),
  ]
}

function defaultSesiones() {
  return [
    newSesion('Semana 1', 'Introducción al tema', 'Reconoce los conceptos básicos', 'Lluvia de ideas, lectura guiada', 'Texto, láminas', 'Participación oral'),
    newSesion('Semana 2', 'Profundización', 'Aplica los conceptos en ejercicios', 'Trabajo en grupos, taller práctico', 'Guías, material concreto', 'Rúbrica de trabajo grupal'),
    newSesion('Semana 3', 'Cierre de unidad', 'Integra lo aprendido en un producto final', 'Elaboración de proyecto final', 'Materiales varios', 'Evaluación sumativa'),
  ]
}

function normalize(s) {
  return String(s).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export default function Planificaciones() {
  const [modo, setModo] = useState('clase')
  const [font, setFont] = useState('arial')
  const [background, setBackground] = useState('blanco')

  const [title, setTitle] = useState('Planificación de clase')

  // Datos de membrete (comunes a ambos modos)
  const [institucion, setInstitucion] = useState('')
  const [docente, setDocente] = useState('')
  const [area, setArea] = useState('')
  const [grado, setGrado] = useState('')
  const [periodo, setPeriodo] = useState('')
  const [tema, setTema] = useState('')

  const [showInstitucion, setShowInstitucion] = useState(true)
  const [showDocente, setShowDocente] = useState(true)
  const [showArea, setShowArea] = useState(true)
  const [showGrado, setShowGrado] = useState(true)
  const [showPeriodo, setShowPeriodo] = useState(true)

  // Modo "clase"
  const [objetivo, setObjetivo] = useState('Reconocer y aplicar los conceptos clave del tema en situaciones cotidianas.')
  const [momentos, setMomentos] = useState(defaultMomentos)
  const [indicador, setIndicador] = useState('El estudiante participa activamente y resuelve los ejercicios propuestos.')
  const [tarea, setTarea] = useState('')

  // Modo "unidad"
  const [objetivoUnidad, setObjetivoUnidad] = useState('Desarrollar las destrezas de la unidad a lo largo de las sesiones planificadas.')
  const [sesiones, setSesiones] = useState(defaultSesiones)

  const [auriLine, setAuriLine] = useState(null)
  const fileInputRef = useRef(null)

  // ---------- Momentos (modo clase) ----------
  function updateMomento(id, field, value) {
    setMomentos((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
  }
  function addMomento() {
    setMomentos((prev) => [...prev, newMomento('Desarrollo')])
  }
  function removeMomento(id) {
    setMomentos((prev) => prev.filter((m) => m.id !== id))
  }
  function moveMomento(id, direction) {
    setMomentos((prev) => {
      const idx = prev.findIndex((m) => m.id === id)
      const newIdx = idx + direction
      if (idx === -1 || newIdx < 0 || newIdx >= prev.length) return prev
      const copy = [...prev]
      const [item] = copy.splice(idx, 1)
      copy.splice(newIdx, 0, item)
      return copy
    })
  }

  // ---------- Sesiones (modo unidad) ----------
  function updateSesion(id, field, value) {
    setSesiones((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }
  function addSesion() {
    setSesiones((prev) => [...prev, newSesion(`Semana ${prev.length + 1}`)])
  }
  function removeSesion(id) {
    setSesiones((prev) => prev.filter((s) => s.id !== id))
  }
  function moveSesion(id, direction) {
    setSesiones((prev) => {
      const idx = prev.findIndex((s) => s.id === id)
      const newIdx = idx + direction
      if (idx === -1 || newIdx < 0 || newIdx >= prev.length) return prev
      const copy = [...prev]
      const [item] = copy.splice(idx, 1)
      copy.splice(newIdx, 0, item)
      return copy
    })
  }

  function handleLoadExample() {
    if (modo === 'clase') {
      setMomentos(defaultMomentos())
      setObjetivo('Reconocer y aplicar los conceptos clave del tema en situaciones cotidianas.')
      setIndicador('El estudiante participa activamente y resuelve los ejercicios propuestos.')
    } else {
      setSesiones(defaultSesiones())
      setObjetivoUnidad('Desarrollar las destrezas de la unidad a lo largo de las sesiones planificadas.')
    }
  }

  function handleClearAll() {
    if (modo === 'clase') {
      setMomentos([newMomento('Inicio')])
      setObjetivo('')
      setIndicador('')
      setTarea('')
    } else {
      setSesiones([newSesion()])
      setObjetivoUnidad('')
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

      if (modo === 'clase') {
        const rows = body.filter((r) => normalize(r[0]) !== 'momento')
        const parsed = rows
          .map((r) => newMomento(String(r[0] || '').trim() || 'Desarrollo', String(r[1] || '').trim(), String(r[2] || '').trim(), String(r[3] || '').trim()))
          .filter((m) => m.actividad)
        if (parsed.length > 0) {
          setMomentos(parsed)
          setAuriLine(AURI_LINES[Math.floor(Math.random() * AURI_LINES.length)])
        }
      } else {
        const rows = body.filter((r) => normalize(r[0]) !== 'sesion')
        const parsed = rows
          .map((r) =>
            newSesion(
              String(r[0] || '').trim(),
              String(r[1] || '').trim(),
              String(r[2] || '').trim(),
              String(r[3] || '').trim(),
              String(r[4] || '').trim(),
              String(r[5] || '').trim(),
            ),
          )
          .filter((s) => s.sesion || s.contenido)
        if (parsed.length > 0) {
          setSesiones(parsed)
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
    if (modo === 'clase') {
      worksheet = XLSX.utils.aoa_to_sheet([
        ['MOMENTO', 'ACTIVIDAD', 'TIEMPO', 'RECURSOS'],
        ['Inicio', 'Activación de conocimientos previos.', '10 min', 'Pizarra, proyector'],
        ['Desarrollo', 'Explicación y trabajo guiado.', '25 min', 'Guía impresa'],
        ['Cierre', 'Puesta en común y retroalimentación.', '10 min', 'Ninguno'],
      ])
    } else {
      worksheet = XLSX.utils.aoa_to_sheet([
        ['SESION', 'CONTENIDO', 'DESTREZA', 'ACTIVIDADES', 'RECURSOS', 'EVALUACION'],
        ['Semana 1', 'Introducción al tema', 'Reconoce los conceptos básicos', 'Lluvia de ideas', 'Texto', 'Participación oral'],
        ['Semana 2', 'Profundización', 'Aplica los conceptos', 'Taller práctico', 'Guías', 'Rúbrica'],
      ])
    }
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Planificacion')
    XLSX.writeFile(workbook, `plantilla-planificacion-${modo}.xlsx`)
  }

  const fontFamily = FONT_FAMILY[font]
  const bgClass = BG_CLASS[background]
  const accentColor = '#8B7FD6'

  const showMembrete = showInstitucion || showDocente || showArea || showGrado || showPeriodo

  return (
    <div className="min-h-screen bg-white dark:bg-deep">
      <style>{`
        @media print {
          @page { size: portrait; margin: 10mm; }
        }
      `}</style>

      <Navbar backHref="#/laboratorio" backLabel="LABORATORIO" />

      <section className="pb-24">
        <PageContainer>
          <div className="text-center mb-6 sm:mb-8 no-print px-2">
            <p className="font-label text-[10px] tracking-widest text-brand mb-4">🗂️ GENERADOR</p>
            <h1 className="font-display text-3xl sm:text-4xl text-deep font-semibold mb-3 dark:text-cream">Planificaciones</h1>
            <p className="text-deep/70 max-w-md mx-auto text-sm sm:text-base dark:text-cream/70">
              Plan de clase o plan de unidad — con tus momentos, tiempos y recursos, listos para imprimir.
            </p>
          </div>

          <div className="grid lg:grid-cols-[400px_1fr] gap-6 sm:gap-8 items-start">
            <PixelPanel title="MÁQUINA DE PLANIFICACIONES" icon="🗂️">
              <PixelField label="Tipo de planificación">
                <div className="flex flex-wrap gap-1.5">
                  {MODO_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setModo(opt.value)
                        setTitle(opt.value === 'clase' ? 'Planificación de clase' : 'Planificación de unidad')
                      }}
                      className={`flex-1 min-w-[130px] text-xs font-medium py-2 border-2 transition-colors ${
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

              <PixelField label="Título del documento">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                  placeholder="Planificación de clase"
                />
              </PixelField>

              <PixelField label="Datos del membrete (se escriben directo en la hoja →)">
                <div className="flex flex-col gap-2">
                  <PixelCheckbox checked={showInstitucion} onChange={(e) => setShowInstitucion(e.target.checked)}>Institución</PixelCheckbox>
                  <PixelCheckbox checked={showDocente} onChange={(e) => setShowDocente(e.target.checked)}>Docente</PixelCheckbox>
                  <PixelCheckbox checked={showArea} onChange={(e) => setShowArea(e.target.checked)}>Área / Asignatura</PixelCheckbox>
                  <PixelCheckbox checked={showGrado} onChange={(e) => setShowGrado(e.target.checked)}>Grado / Curso</PixelCheckbox>
                  <PixelCheckbox checked={showPeriodo} onChange={(e) => setShowPeriodo(e.target.checked)}>Período / Fecha</PixelCheckbox>
                </div>
              </PixelField>

              <PixelField label={modo === 'clase' ? 'Objetivo de la clase' : 'Objetivo de la unidad'}>
                <textarea
                  value={modo === 'clase' ? objetivo : objetivoUnidad}
                  onChange={(e) => (modo === 'clase' ? setObjetivo(e.target.value) : setObjetivoUnidad(e.target.value))}
                  rows={3}
                  placeholder="¿Qué se espera lograr?"
                  className="w-full border-2 border-deep p-2 text-sm text-deep focus:outline-none focus:border-brand bg-white resize-none dark:text-cream dark:border-cream/40 dark:bg-deep"
                />
              </PixelField>

              {/* Import Excel — formato distinto según modo */}
              <PixelField label={modo === 'clase' ? 'Momentos de la clase' : 'Sesiones de la unidad'}>
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

                {modo === 'clase' && (
                  <div className="space-y-1.5">
                    {momentos.map((m, i) => (
                      <div key={m.id} className="border-2 border-deep/20 p-2 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <select
                            value={m.momento}
                            onChange={(e) => updateMomento(m.id, 'momento', e.target.value)}
                            className="shrink-0 border-2 border-deep p-1.5 text-xs text-deep bg-white focus:outline-none focus:border-brand dark:text-cream dark:border-cream/40 dark:bg-deep"
                          >
                            {MOMENTO_OPTIONS.map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={m.tiempo}
                            onChange={(e) => updateMomento(m.id, 'tiempo', e.target.value)}
                            placeholder="tiempo"
                            className="w-20 shrink-0 border-2 border-deep p-1.5 text-xs text-deep text-center focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                          />
                          <div className="flex items-center gap-1 shrink-0 ml-auto">
                            <div className="flex flex-col shrink-0">
                              <button onClick={() => moveMomento(m.id, -1)} disabled={i === 0} className="w-5 h-3.5 flex items-center justify-center text-deep/40 hover:text-brand disabled:opacity-20 leading-none text-[10px]">▲</button>
                              <button onClick={() => moveMomento(m.id, 1)} disabled={i === momentos.length - 1} className="w-5 h-3.5 flex items-center justify-center text-deep/40 hover:text-brand disabled:opacity-20 leading-none text-[10px]">▼</button>
                            </div>
                            <button onClick={() => removeMomento(m.id)} className="shrink-0 w-7 h-7 flex items-center justify-center text-deep/40 hover:text-blossom hover:border-blossom border-2 border-transparent">✕</button>
                          </div>
                        </div>
                        <textarea
                          value={m.actividad}
                          onChange={(e) => updateMomento(m.id, 'actividad', e.target.value)}
                          placeholder="Actividad..."
                          rows={2}
                          className="w-full border-2 border-deep p-1.5 text-xs text-deep focus:outline-none focus:border-brand bg-white resize-none dark:text-cream dark:border-cream/40 dark:bg-deep"
                        />
                        <input
                          type="text"
                          value={m.recursos}
                          onChange={(e) => updateMomento(m.id, 'recursos', e.target.value)}
                          placeholder="Recursos..."
                          className="w-full border-2 border-deep p-1.5 text-xs text-deep focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                        />
                      </div>
                    ))}
                    <PixelButton variant="ghost" onClick={addMomento}>+ Agregar momento</PixelButton>
                  </div>
                )}

                {modo === 'unidad' && (
                  <div className="space-y-1.5">
                    {sesiones.map((s, i) => (
                      <div key={s.id} className="border-2 border-deep/20 p-2 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <input
                            type="text"
                            value={s.sesion}
                            onChange={(e) => updateSesion(s.id, 'sesion', e.target.value)}
                            placeholder={`Sesión ${i + 1}`}
                            className="flex-1 min-w-[100px] border-2 border-deep p-1.5 text-xs font-semibold text-deep focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <div className="flex flex-col shrink-0">
                              <button onClick={() => moveSesion(s.id, -1)} disabled={i === 0} className="w-5 h-3.5 flex items-center justify-center text-deep/40 hover:text-brand disabled:opacity-20 leading-none text-[10px]">▲</button>
                              <button onClick={() => moveSesion(s.id, 1)} disabled={i === sesiones.length - 1} className="w-5 h-3.5 flex items-center justify-center text-deep/40 hover:text-brand disabled:opacity-20 leading-none text-[10px]">▼</button>
                            </div>
                            <button onClick={() => removeSesion(s.id)} className="shrink-0 w-7 h-7 flex items-center justify-center text-deep/40 hover:text-blossom hover:border-blossom border-2 border-transparent">✕</button>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={s.contenido}
                          onChange={(e) => updateSesion(s.id, 'contenido', e.target.value)}
                          placeholder="Contenido / tema"
                          className="w-full border-2 border-deep p-1.5 text-xs text-deep focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                        />
                        <input
                          type="text"
                          value={s.destreza}
                          onChange={(e) => updateSesion(s.id, 'destreza', e.target.value)}
                          placeholder="Destreza / competencia"
                          className="w-full border-2 border-deep p-1.5 text-xs text-deep focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                        />
                        <textarea
                          value={s.actividades}
                          onChange={(e) => updateSesion(s.id, 'actividades', e.target.value)}
                          placeholder="Actividades..."
                          rows={2}
                          className="w-full border-2 border-deep p-1.5 text-xs text-deep focus:outline-none focus:border-brand bg-white resize-none dark:text-cream dark:border-cream/40 dark:bg-deep"
                        />
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            value={s.recursos}
                            onChange={(e) => updateSesion(s.id, 'recursos', e.target.value)}
                            placeholder="Recursos"
                            className="w-full border-2 border-deep p-1.5 text-xs text-deep focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                          />
                          <input
                            type="text"
                            value={s.evaluacion}
                            onChange={(e) => updateSesion(s.id, 'evaluacion', e.target.value)}
                            placeholder="Evaluación"
                            className="w-full border-2 border-deep p-1.5 text-xs text-deep focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                          />
                        </div>
                      </div>
                    ))}
                    <PixelButton variant="ghost" onClick={addSesion}>+ Agregar sesión</PixelButton>
                  </div>
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

              {modo === 'clase' && (
                <>
                  <PixelField label="Indicador de logro / evaluación">
                    <textarea
                      value={indicador}
                      onChange={(e) => setIndicador(e.target.value)}
                      rows={2}
                      placeholder="¿Cómo sabrás que se logró el objetivo?"
                      className="w-full border-2 border-deep p-2 text-sm text-deep focus:outline-none focus:border-brand bg-white resize-none dark:text-cream dark:border-cream/40 dark:bg-deep"
                    />
                  </PixelField>
                  <PixelField label="Tarea / trabajo autónomo (opcional)">
                    <textarea
                      value={tarea}
                      onChange={(e) => setTarea(e.target.value)}
                      rows={2}
                      placeholder="Deja vacío si no aplica"
                      className="w-full border-2 border-deep p-2 text-sm text-deep focus:outline-none focus:border-brand bg-white resize-none dark:text-cream dark:border-cream/40 dark:bg-deep"
                    />
                  </PixelField>
                </>
              )}

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
                          {modo === 'clase' ? 'PLAN DE CLASE' : 'PLAN DE UNIDAD'}
                        </p>
                        <h2 className="font-display text-2xl sm:text-[28px] text-deep font-semibold leading-tight" style={{ fontFamily }}>
                          {title}
                        </h2>
                      </div>
                      <div className="shrink-0 w-14 h-14 rounded-full border-2 flex items-center justify-center" style={{ borderColor: accentColor }}>
                        <span className="text-xl">🗂️</span>
                      </div>
                    </div>

                    {/* Datos de membrete */}
                    {showMembrete && (
                      <div className="flex flex-wrap gap-x-10 gap-y-3 mb-6">
                        {showInstitucion && (
                          <div className="flex items-baseline gap-2 flex-1 min-w-[200px]">
                            <span className="font-label text-[8px] tracking-wide text-deep/45 shrink-0">INSTITUCIÓN:</span>
                            <input type="text" value={institucion} onChange={(e) => setInstitucion(e.target.value)} placeholder="_______________________" style={{ fontFamily }} className="flex-1 border-0 bg-transparent px-1 py-0.5 text-sm text-deep placeholder:text-deep/25 focus:outline-none min-w-[120px]" />
                          </div>
                        )}
                        {showDocente && (
                          <div className="flex items-baseline gap-2 min-w-[180px]">
                            <span className="font-label text-[8px] tracking-wide text-deep/45 shrink-0">DOCENTE:</span>
                            <input type="text" value={docente} onChange={(e) => setDocente(e.target.value)} placeholder="__________" style={{ fontFamily }} className="flex-1 border-0 bg-transparent px-1 py-0.5 text-sm text-deep placeholder:text-deep/25 focus:outline-none min-w-[100px]" />
                          </div>
                        )}
                        {showArea && (
                          <div className="flex items-baseline gap-2 min-w-[160px]">
                            <span className="font-label text-[8px] tracking-wide text-deep/45 shrink-0">ÁREA:</span>
                            <input type="text" value={area} onChange={(e) => setArea(e.target.value)} placeholder="__________" style={{ fontFamily }} className="flex-1 border-0 bg-transparent px-1 py-0.5 text-sm text-deep placeholder:text-deep/25 focus:outline-none min-w-[90px]" />
                          </div>
                        )}
                        {showGrado && (
                          <div className="flex items-baseline gap-2 min-w-[140px]">
                            <span className="font-label text-[8px] tracking-wide text-deep/45 shrink-0">GRADO:</span>
                            <input type="text" value={grado} onChange={(e) => setGrado(e.target.value)} placeholder="__________" style={{ fontFamily }} className="flex-1 border-0 bg-transparent px-1 py-0.5 text-sm text-deep placeholder:text-deep/25 focus:outline-none min-w-[80px]" />
                          </div>
                        )}
                        {showPeriodo && (
                          <div className="flex items-baseline gap-2 min-w-[160px]">
                            <span className="font-label text-[8px] tracking-wide text-deep/45 shrink-0">PERÍODO:</span>
                            <input type="text" value={periodo} onChange={(e) => setPeriodo(e.target.value)} placeholder="__________" style={{ fontFamily }} className="flex-1 border-0 bg-transparent px-1 py-0.5 text-sm text-deep placeholder:text-deep/25 focus:outline-none min-w-[90px]" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Objetivo */}
                    <div className="mb-6 border-l-4 pl-4" style={{ borderColor: accentColor }}>
                      <p className="font-label text-[8px] tracking-wide text-deep/45 mb-1">
                        {modo === 'clase' ? 'OBJETIVO DE LA CLASE' : 'OBJETIVO DE LA UNIDAD'}
                      </p>
                      <p className="text-sm text-deep/85 leading-relaxed">
                        {(modo === 'clase' ? objetivo : objetivoUnidad) || '—'}
                      </p>
                    </div>

                    {/* ---------- TABLA: PLAN DE CLASE ---------- */}
                    {modo === 'clase' && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse table-fixed min-w-[600px]">
                          <colgroup>
                            <col style={{ width: '110px' }} />
                            <col />
                            <col style={{ width: '70px' }} />
                            <col style={{ width: '160px' }} />
                          </colgroup>
                          <thead>
                            <tr>
                              <th className="p-2.5 text-[10px] font-label tracking-wide text-white" style={{ backgroundColor: '#1a1a2e' }}>MOMENTO</th>
                              <th className="p-2.5 text-[10px] font-label tracking-wide text-white border-l border-white/10">ACTIVIDAD</th>
                              <th className="p-2.5 text-[10px] font-label tracking-wide text-white border-l border-white/10">TIEMPO</th>
                              <th className="p-2.5 text-[10px] font-label tracking-wide text-white border-l border-white/10">RECURSOS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {momentos.map((m, rowIdx) => (
                              <tr key={m.id} className={rowIdx % 2 === 1 ? 'bg-black/[0.02]' : ''}>
                                <td className="border border-deep/15 p-2.5 text-[11px] font-semibold text-deep/80 align-top">{m.momento}</td>
                                <td className="border border-deep/15 p-0">
                                  <textarea
                                    value={m.actividad}
                                    onChange={(e) => updateMomento(m.id, 'actividad', e.target.value)}
                                    placeholder="Actividad..."
                                    rows={2}
                                    style={{ fontFamily }}
                                    className="w-full h-full min-h-[54px] resize-none border-0 bg-transparent p-2 text-[11px] leading-snug text-deep/85 placeholder:text-deep/25 focus:outline-none focus:bg-white/60"
                                  />
                                </td>
                                <td className="border border-deep/15 p-2.5 text-[11px] text-center text-deep/60 align-top">{m.tiempo || '—'}</td>
                                <td className="border border-deep/15 p-2.5 text-[11px] text-deep/70 align-top">{m.recursos || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* ---------- TABLA: PLAN DE UNIDAD ---------- */}
                    {modo === 'unidad' && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[760px]">
                          <thead>
                            <tr>
                              <th className="p-2.5 text-[10px] font-label tracking-wide text-white" style={{ backgroundColor: '#1a1a2e' }}>SESIÓN</th>
                              <th className="p-2.5 text-[10px] font-label tracking-wide text-white border-l border-white/10">CONTENIDO</th>
                              <th className="p-2.5 text-[10px] font-label tracking-wide text-white border-l border-white/10">DESTREZA</th>
                              <th className="p-2.5 text-[10px] font-label tracking-wide text-white border-l border-white/10">ACTIVIDADES</th>
                              <th className="p-2.5 text-[10px] font-label tracking-wide text-white border-l border-white/10">RECURSOS</th>
                              <th className="p-2.5 text-[10px] font-label tracking-wide text-white border-l border-white/10">EVALUACIÓN</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sesiones.map((s, rowIdx) => (
                              <tr key={s.id} className={rowIdx % 2 === 1 ? 'bg-black/[0.02]' : ''}>
                                <td className="border border-deep/15 p-2.5 text-[11px] font-semibold text-deep/80 align-top">{s.sesion || '—'}</td>
                                <td className="border border-deep/15 p-2.5 text-[11px] text-deep/80 align-top">{s.contenido || '—'}</td>
                                <td className="border border-deep/15 p-2.5 text-[11px] text-deep/80 align-top">{s.destreza || '—'}</td>
                                <td className="border border-deep/15 p-2.5 text-[11px] text-deep/80 align-top">{s.actividades || '—'}</td>
                                <td className="border border-deep/15 p-2.5 text-[11px] text-deep/70 align-top">{s.recursos || '—'}</td>
                                <td className="border border-deep/15 p-2.5 text-[11px] text-deep/70 align-top">{s.evaluacion || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Indicador / tarea (modo clase) */}
                    {modo === 'clase' && (indicador || tarea) && (
                      <div className="mt-6 space-y-3">
                        {indicador && (
                          <div className="border-l-4 pl-4" style={{ borderColor: accentColor }}>
                            <p className="font-label text-[8px] tracking-wide text-deep/45 mb-1">INDICADOR DE LOGRO</p>
                            <p className="text-sm text-deep/85 leading-relaxed">{indicador}</p>
                          </div>
                        )}
                        {tarea && (
                          <div className="border-l-4 pl-4 border-deep/20">
                            <p className="font-label text-[8px] tracking-wide text-deep/45 mb-1">TAREA / TRABAJO AUTÓNOMO</p>
                            <p className="text-sm text-deep/85 leading-relaxed">{tarea}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Firma */}
                    <div className="mt-10 flex flex-wrap justify-end gap-8 pt-6">
                      <div className="flex-1 min-w-[180px] max-w-[240px] text-center">
                        <div className="border-t border-deep/40 pt-1.5">
                          <p className="text-[10px] text-deep/50">Firma del docente</p>
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
