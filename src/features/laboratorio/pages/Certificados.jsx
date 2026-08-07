import { useState } from 'react'
import * as XLSX from 'xlsx'
import { PixelCheckbox, PixelSegmented, PixelButton } from '../../../components/ui'
import { AuriNote } from '../../../components/auri'
import { PixelPanel, PixelField, EmptyPreview } from '../components'
import { Navbar, Footer, PageContainer } from '../../../components/layout'

const AURI_LINES = [
  'Un certificado deja constancia de lo cumplido.',
  '¿Revisamos el código antes de imprimir todos?',
  'Buen trabajo cerrando el taller.',
  'Esto también sirve para tu portafolio docente.',
]

const EXAMPLE_NAMES = 'María José Andrade\nCarlos Mendoza\nSofía Vera\nMateo Chávez\nEmilia Torres'

const MAX_IMAGE_BYTES = 3 * 1024 * 1024 // 3MB — evita certificados pesadísimos al imprimir/exportar
const MAX_HEADER_LINES = 4

const HEADER_WORD_RE = /^(nombre|nombres|estudiante|estudiantes|apellidos?|alumno|alumnos?)s?\s*$/i

// A diferencia de Diplomas (un logro individual), Certificados documenta la
// participación en algo puntual: un taller, curso o capacitación — por eso
// pide curso, horas y un código, en vez de un "motivo" libre.
const TYPES = {
  participacion: { label: 'Participación', verb: 'participó en' },
  asistencia: { label: 'Asistencia', verb: 'asistió a' },
  aprobacion: { label: 'Aprobación', verb: 'aprobó' },
}
const TYPE_OPTIONS = Object.entries(TYPES).map(([value, cfg]) => ({ value, label: cfg.label }))

// Mismos temas de color que Diplomas — se agregaría un theme.js compartido
// si esta paleta se repite en un tercer generador.
const THEMES = {
  deep: { label: 'Formal', border: 'border-deep', innerBorder: 'border-deep/25', text: 'text-deep', corner: 'text-deep/70' },
  brand: { label: 'Morado', border: 'border-brand', innerBorder: 'border-brand/30', text: 'text-brand', corner: 'text-brand' },
  mint: { label: 'Verde', border: 'border-mint', innerBorder: 'border-mint/40', text: 'text-deep', corner: 'text-mint' },
  sun: { label: 'Dorado', border: 'border-sun', innerBorder: 'border-sun/40', text: 'text-deep', corner: 'text-sun' },
}
const THEME_OPTIONS = Object.entries(THEMES).map(([value, cfg]) => ({ value, label: cfg.label }))

// Fondos decorativos — símbolos repetidos muy tenues detrás del contenido.
const BACKGROUNDS = {
  none: { label: 'Ninguno', symbols: null },
  math: { label: 'Matemáticas', symbols: ['π', '∑', '√', '∞', '÷', '×', 'Δ', '∫'] },
  letras: { label: 'Letras', symbols: ['A', 'a', 'B', '¶', '“', '”', 'b', 'C'] },
  arte: { label: 'Arte', symbols: ['🎨', '🖌️', '✦', '🎭', '🖼️', '✎'] },
}
const BACKGROUND_OPTIONS = Object.entries(BACKGROUNDS).map(([value, cfg]) => ({ value, label: cfg.label }))

// Tipografías reales, web-safe.
const FONTS = {
  default: { label: 'Predeterminada', family: null },
  arial: { label: 'Arial', family: 'Arial, Helvetica, sans-serif' },
  times: { label: 'Times New Roman', family: "'Times New Roman', Times, serif" },
  georgia: { label: 'Georgia', family: 'Georgia, serif' },
  calibri: { label: 'Calibri', family: "Calibri, Candara, 'Segoe UI', sans-serif" },
  verdana: { label: 'Verdana', family: 'Verdana, Geneva, sans-serif' },
}
const FONT_OPTIONS = Object.entries(FONTS).map(([value, cfg]) => ({ value, ...cfg }))

// Tamaños de logo (recuadro) y de firma (alto de imagen).
const LOGO_SIZES = {
  sm: { label: 'Pequeño', boxClass: 'w-9 sm:w-10 h-8 sm:h-9' },
  md: { label: 'Mediano', boxClass: 'w-12 sm:w-14 h-10 sm:h-12' },
  lg: { label: 'Grande', boxClass: 'w-16 sm:w-20 h-14 sm:h-16' },
}
const LOGO_SIZE_OPTIONS = Object.entries(LOGO_SIZES).map(([value, cfg]) => ({ value, label: cfg.label }))

const SIGNATURE_SIZES = {
  sm: { label: 'Pequeña', imgClass: 'h-6' },
  md: { label: 'Mediana', imgClass: 'h-8 sm:h-10' },
  lg: { label: 'Grande', imgClass: 'h-12 sm:h-14' },
}
const SIGNATURE_SIZE_OPTIONS = Object.entries(SIGNATURE_SIZES).map(([value, cfg]) => ({ value, label: cfg.label }))

// Escalas de tamaño de letra — multiplican los tamaños base (px) de cada texto.
const TEXT_SIZES = {
  sm: { label: 'Pequeña', scale: 0.82 },
  md: { label: 'Mediana', scale: 1 },
  lg: { label: 'Grande', scale: 1.2 },
}
const TEXT_SIZE_OPTIONS = Object.entries(TEXT_SIZES).map(([value, cfg]) => ({ value, label: cfg.label }))

// Tamaños base en px (antes de escalar) para cada pieza de texto del certificado.
const BASE_PX = {
  headerLine: [12, 10, 9, 9],
  title: 28,
  intro: 13,
  name: 24,
  body: 13,
  signerName: 13,
  signerRole: 10,
  footer: 11,
}

let headerLineSeq = 0
function newHeaderLine(text = '') {
  headerLineSeq += 1
  return { id: `hl-${headerLineSeq}`, text }
}

function parseNames(raw) {
  return raw
    .split('\n')
    .map((n) => n.trim())
    .filter((n) => n.length > 0)
}

function buildCode(prefix, index) {
  const year = new Date().getFullYear()
  const p = (prefix || 'AK').trim().toUpperCase()
  return `${p}-${year}-${String(index + 1).padStart(4, '0')}`
}

function readImageFile(file, onLoaded) {
  if (!file) return
  if (file.size > MAX_IMAGE_BYTES) {
    alert('Esa imagen pesa demasiado. Usa un archivo más liviano (menos de 3MB) para que el certificado no se vuelva pesado al imprimir.')
    return
  }
  const reader = new FileReader()
  reader.onload = () => onLoaded({ name: file.name, dataUrl: reader.result })
  reader.readAsDataURL(file)
}

function readNamesFromSpreadsheet(file, onLoaded, onError) {
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[firstSheetName]
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

      let values = rows
        .map((row) => (row && row[0] !== undefined ? String(row[0]).trim() : ''))
        .filter((v) => v.length > 0)

      if (values.length > 0 && HEADER_WORD_RE.test(values[0])) {
        values = values.slice(1)
      }

      if (values.length === 0) {
        onError('No encontré nombres en la primera columna del archivo. Revisa que los nombres estén en la columna A.')
        return
      }

      onLoaded(values.join('\n'))
    } catch (err) {
      onError('No pude leer ese archivo. Asegúrate de que sea un .xlsx, .xls o .csv válido.')
    }
  }
  reader.onerror = () => onError('No pude leer ese archivo.')
  reader.readAsArrayBuffer(file)
}

function ImageUploadSlot({ label, image, onUpload, onRemove, heightClass = 'h-20', imgClass = 'max-h-12' }) {
  return (
    <div>
      <label className={`relative flex flex-col items-center justify-center gap-1 border-2 border-dashed border-deep/30 ${heightClass} cursor-pointer hover:border-deep hover:bg-cream transition-colors`}>
        {image ? (
          <>
            <img src={image.dataUrl} alt={image.name} className={`${imgClass} max-w-[80%] object-contain`} />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                onRemove()
              }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-deep text-white text-xs flex items-center justify-center border-2 border-white focus:outline-none"
              aria-label={`Quitar ${label}`}
            >
              ×
            </button>
          </>
        ) : (
          <span className="text-xs text-deep/50 text-center px-2">+ Subir</span>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            readImageFile(file, onUpload)
            e.target.value = ''
          }}
        />
      </label>
      <p className="text-[10px] text-deep/50 mt-1 text-center truncate">{label}</p>
    </div>
  )
}

function CertificateBackground({ background }) {
  const bg = BACKGROUNDS[background]
  if (!bg || !bg.symbols) return null
  const cells = Array.from({ length: 24 })
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-[0.07]" aria-hidden="true">
      <div className="grid grid-cols-6 h-full w-full">
        {cells.map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-center font-display text-3xl sm:text-4xl text-deep"
            style={{ transform: `rotate(${((i * 37) % 40) - 20}deg)` }}
          >
            {bg.symbols[i % bg.symbols.length]}
          </div>
        ))}
      </div>
    </div>
  )
}

function CollapsibleSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-2 border-deep/15 mb-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-cream/60 hover:bg-cream transition-colors focus:outline-none"
      >
        <span className="font-label text-[10px] tracking-widest text-deep">{title}</span>
        <span className="text-deep/50 text-sm">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="p-3">{children}</div>}
    </div>
  )
}

// Selector de tipografía en cuadrícula — cada tarjeta muestra su nombre en su
// propia fuente, para previsualizar antes de elegir.
function FontPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {FONT_OPTIONS.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`text-left border-2 px-3 py-2 transition-colors focus:outline-none ${
              active ? 'border-brand bg-brand/10' : 'border-deep/20 hover:border-deep/50'
            }`}
          >
            <span
              className={`block text-sm truncate ${active ? 'text-brand font-semibold' : 'text-deep'}`}
              style={opt.family ? { fontFamily: opt.family } : undefined}
            >
              {opt.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default function Certificados() {
  const [namesInput, setNamesInput] = useState(EXAMPLE_NAMES)
  const [importError, setImportError] = useState('')
  const [type, setType] = useState('participacion')
  const [courseName, setCourseName] = useState('')
  const [hours, setHours] = useState('')
  const [customBody, setCustomBody] = useState('')

  // Encabezado vacío por defecto — cada quien pone su institución, facultad, carrera, etc.
  const [headerLines, setHeaderLines] = useState([newHeaderLine('')])

  const [dateLabel, setDateLabel] = useState('')
  const [includeCode, setIncludeCode] = useState(true)
  const [codePrefix, setCodePrefix] = useState('AK')
  const [signer1Name, setSigner1Name] = useState('')
  const [signer1Role, setSigner1Role] = useState('Docente')
  const [signer1Signature, setSigner1Signature] = useState(null)
  const [includeSigner2, setIncludeSigner2] = useState(false)
  const [signer2Name, setSigner2Name] = useState('')
  const [signer2Role, setSigner2Role] = useState('Director/a')
  const [signer2Signature, setSigner2Signature] = useState(null)
  const [theme, setTheme] = useState('deep')
  const [background, setBackground] = useState('none')
  const [font, setFont] = useState('default')
  const [logoSize, setLogoSize] = useState('md')
  const [signatureSize, setSignatureSize] = useState('md')
  const [textSize, setTextSize] = useState('md')

  const [logo1, setLogo1] = useState(null)
  const [logo2, setLogo2] = useState(null)

  const [names, setNames] = useState(null)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [auriLine, setAuriLine] = useState(null)

  function handleGenerate() {
    const parsed = parseNames(namesInput)
    if (parsed.length === 0) return
    setNames(parsed)
    setPreviewIndex(0)
    setAuriLine(AURI_LINES[Math.floor(Math.random() * AURI_LINES.length)])
  }

  function handlePrint() {
    window.print()
  }

  function handleLoadExample() {
    setNamesInput(EXAMPLE_NAMES)
    setImportError('')
  }

  function handleClear() {
    setNamesInput('')
    setImportError('')
  }

  function handleSpreadsheetUpload(file) {
    setImportError('')
    readNamesFromSpreadsheet(
      file,
      (joined) => setNamesInput(joined),
      (msg) => setImportError(msg)
    )
  }

  function updateHeaderLine(id, text) {
    setHeaderLines((lines) => lines.map((l) => (l.id === id ? { ...l, text } : l)))
  }

  function addHeaderLine() {
    setHeaderLines((lines) => (lines.length >= MAX_HEADER_LINES ? lines : [...lines, newHeaderLine()]))
  }

  function removeHeaderLine(id) {
    setHeaderLines((lines) => lines.filter((l) => l.id !== id))
  }

  const t = THEMES[theme]
  const typeCfg = TYPES[type]
  const count = parseNames(namesInput).length
  const activeHeaderLines = headerLines.filter((l) => l.text.trim().length > 0)
  const showHeaderRow = Boolean(logo1 || logo2 || activeHeaderLines.length > 0)
  const fontFamily = FONTS[font]?.family || undefined
  const scale = TEXT_SIZES[textSize].scale
  const px = (base) => `${Math.round(base * scale)}px`
  const logoBoxClass = LOGO_SIZES[logoSize].boxClass
  const signatureImgClass = SIGNATURE_SIZES[signatureSize].imgClass

  // Estilo de texto reutilizable — aplica fuente y tamaño escalado directo en
  // cada elemento, para que TODO el certificado cambie junto.
  const textStyle = (basePx) => ({
    fontFamily,
    fontSize: px(basePx),
  })

  return (
    <div className="min-h-screen bg-white dark:bg-deep">
      {/* Igual que en Diplomas: horizontal solo mientras esta página está montada.
          IMPORTANTE: usamos "297mm 210mm" (A4 explícito) en vez de la palabra
          clave "landscape". Muchos drivers de impresoras físicas (Epson, HP, etc.)
          IGNORAN "landscape" y solo respetan orientación real cuando les das el
          ancho x alto exactos. Con las dimensiones explícitas, la hoja sale
          horizontal sin que el usuario tenga que cambiar nada manualmente en el
          diálogo de impresión. */}
      <style>{`
        @media print {
          @page {
            size: 297mm 210mm;
            margin: 1cm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body * { visibility: hidden; }
          .printable, .printable * { visibility: visible; }
          .printable {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
          }
          .printable > div {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 1.414 / 1 !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="no-print">
        <Navbar backHref="#/laboratorio" backLabel="LABORATORIO" />
      </div>

      <section className="pb-24">
        <PageContainer>
          <div className="text-center mb-8 sm:mb-10 no-print px-2">
            <p className="font-label text-[10px] tracking-widest text-brand mb-4">📜 GENERADOR</p>
            <h1 className="font-display text-3xl sm:text-4xl text-deep font-semibold mb-3 dark:text-cream">Certificados</h1>
            <p className="text-deep/70 max-w-md mx-auto text-sm sm:text-base dark:text-cream/70">
              Para talleres, cursos o capacitaciones — con curso, horas y un código de
              verificación por estudiante.
            </p>
          </div>

          <div className="grid lg:grid-cols-[340px_1fr] gap-6 sm:gap-8 items-start">
            <PixelPanel title="MÁQUINA DE CERTIFICADOS" icon="📜">
              <PixelField
                label="Estudiantes (uno por línea)"
                hint="Escríbelos a mano o sube un Excel/CSV con los nombres en la primera columna."
              >
                <textarea
                  value={namesInput}
                  onChange={(e) => setNamesInput(e.target.value)}
                  rows={6}
                  className="w-full border-2 border-deep p-3 font-body text-sm text-deep focus:outline-none focus:border-brand resize-none bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                  placeholder={'María José Andrade\nCarlos Mendoza'}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleLoadExample}
                    className="flex-1 text-xs font-medium text-deep/60 border-2 border-dashed border-deep/30 py-1.5 hover:border-deep hover:text-deep hover:bg-white transition-colors focus:outline-none dark:text-cream/60 dark:border-cream/30 dark:hover:bg-cream/10 dark:hover:border-cream dark:hover:text-cream"
                  >
                    Cargar ejemplo
                  </button>
                  <button
                    onClick={handleClear}
                    className="flex-1 text-xs font-medium text-deep/60 border-2 border-dashed border-deep/30 py-1.5 hover:border-deep hover:text-deep hover:bg-white transition-colors focus:outline-none dark:text-cream/60 dark:border-cream/30 dark:hover:bg-cream/10 dark:hover:border-cream dark:hover:text-cream"
                  >
                    Limpiar
                  </button>
                </div>
                <label className="mt-2 flex items-center justify-center gap-2 text-xs font-medium text-brand border-2 border-dashed border-brand/40 py-1.5 hover:border-brand hover:bg-cream transition-colors cursor-pointer">
                  📥 Subir Excel / CSV
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      handleSpreadsheetUpload(file)
                      e.target.value = ''
                    }}
                  />
                </label>
                {importError && <p className="text-[11px] text-red-600 mt-1.5">{importError}</p>}
              </PixelField>

              <CollapsibleSection title="CONTENIDO DEL CERTIFICADO" defaultOpen>
                <PixelField label="Tipo de certificado">
                  <PixelSegmented options={TYPE_OPTIONS} value={type} onChange={setType} />
                </PixelField>

                <PixelField label="Nombre del curso o taller" hint="Aparece en el cuerpo del certificado, ej. «Uso de IA en el aula».">
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                    placeholder="Ej. Uso de IA en el aula"
                  />
                </PixelField>

                <PixelField label="Horas académicas (opcional)">
                  <input
                    type="text"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                    placeholder="Ej. 20"
                    inputMode="numeric"
                  />
                </PixelField>

                <PixelField
                  label="Texto del cuerpo (opcional)"
                  hint="Si lo dejas vacío, se genera automáticamente con el curso y las horas que pusiste arriba."
                >
                  <textarea
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    rows={3}
                    className="w-full border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus:border-brand resize-none bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                    placeholder={`${typeCfg.verb} "${courseName || 'el curso indicado'}"${hours ? `, con una duración de ${hours} horas académicas` : ''}.`}
                  />
                </PixelField>

                <PixelField>
                  <PixelCheckbox checked={includeCode} onChange={(e) => setIncludeCode(e.target.checked)}>
                    Incluir código de certificado
                  </PixelCheckbox>
                  {includeCode && (
                    <input
                      type="text"
                      value={codePrefix}
                      onChange={(e) => setCodePrefix(e.target.value)}
                      className="mt-3 w-full border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                      placeholder="Prefijo, ej. AK"
                      maxLength={8}
                    />
                  )}
                </PixelField>
              </CollapsibleSection>

              <CollapsibleSection title="ENCABEZADO Y LOGOS">
                <PixelField
                  label="Encabezado (opcional)"
                  hint="Ej. Universidad, Facultad, Carrera. Cada línea se ve un poco más pequeña que la anterior."
                >
                  <div className="space-y-2">
                    {headerLines.map((line, i) => (
                      <div key={line.id} className="flex gap-2">
                        <input
                          type="text"
                          value={line.text}
                          onChange={(e) => updateHeaderLine(line.id, e.target.value)}
                          className="flex-1 border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                          placeholder={
                            i === 0
                              ? 'Ej. Universidad Central del Ecuador'
                              : i === 1
                              ? 'Ej. Facultad de Filosofía, Letras y Ciencias de la Educación'
                              : 'Ej. Carrera de Pedagogía...'
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeHeaderLine(line.id)}
                          className="w-9 border-2 border-deep text-deep/60 hover:text-deep hover:bg-cream focus:outline-none"
                          aria-label="Quitar línea"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {headerLines.length < MAX_HEADER_LINES && (
                      <button
                        type="button"
                        onClick={addHeaderLine}
                        className="w-full text-xs font-medium text-deep/60 border-2 border-dashed border-deep/30 py-1.5 hover:border-deep hover:text-deep hover:bg-white transition-colors focus:outline-none dark:text-cream/60 dark:border-cream/30 dark:hover:bg-cream/10 dark:hover:border-cream dark:hover:text-cream"
                      >
                        + Agregar línea
                      </button>
                    )}
                  </div>
                </PixelField>

                <PixelField label="Logos" hint="PNG o JPG. Se ubican junto al encabezado.">
                  <div className="grid grid-cols-2 gap-2">
                    <ImageUploadSlot label="Logo institución" image={logo1} onUpload={setLogo1} onRemove={() => setLogo1(null)} />
                    <ImageUploadSlot label="Logo secundario" image={logo2} onUpload={setLogo2} onRemove={() => setLogo2(null)} />
                  </div>
                </PixelField>

                <PixelField label="Tamaño de logos">
                  <PixelSegmented options={LOGO_SIZE_OPTIONS} value={logoSize} onChange={setLogoSize} />
                </PixelField>
              </CollapsibleSection>

              <CollapsibleSection title="FIRMAS">
                <PixelField label="Firma 1">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={signer1Name}
                      onChange={(e) => setSigner1Name(e.target.value)}
                      className="w-full border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                      placeholder="Nombre"
                    />
                    <input
                      type="text"
                      value={signer1Role}
                      onChange={(e) => setSigner1Role(e.target.value)}
                      className="w-full border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                      placeholder="Cargo"
                    />
                  </div>
                  <div className="mt-2 max-w-[160px]">
                    <ImageUploadSlot
                      label="Firma escaneada (opcional)"
                      image={signer1Signature}
                      onUpload={setSigner1Signature}
                      onRemove={() => setSigner1Signature(null)}
                      heightClass="h-14"
                      imgClass="max-h-8"
                    />
                  </div>
                </PixelField>

                <PixelField>
                  <PixelCheckbox checked={includeSigner2} onChange={(e) => setIncludeSigner2(e.target.checked)}>
                    Agregar una segunda firma
                  </PixelCheckbox>
                  {includeSigner2 && (
                    <>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <input
                          type="text"
                          value={signer2Name}
                          onChange={(e) => setSigner2Name(e.target.value)}
                          className="w-full border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                          placeholder="Nombre"
                        />
                        <input
                          type="text"
                          value={signer2Role}
                          onChange={(e) => setSigner2Role(e.target.value)}
                          className="w-full border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                          placeholder="Cargo"
                        />
                      </div>
                      <div className="mt-2 max-w-[160px]">
                        <ImageUploadSlot
                          label="Firma escaneada (opcional)"
                          image={signer2Signature}
                          onUpload={setSigner2Signature}
                          onRemove={() => setSigner2Signature(null)}
                          heightClass="h-14"
                          imgClass="max-h-8"
                        />
                      </div>
                    </>
                  )}
                </PixelField>

                <PixelField label="Tamaño de firma">
                  <PixelSegmented options={SIGNATURE_SIZE_OPTIONS} value={signatureSize} onChange={setSignatureSize} />
                </PixelField>
              </CollapsibleSection>

              <CollapsibleSection title="FECHA Y ESTILO">
                <PixelField label="Fecha o lugar y fecha (opcional)">
                  <input
                    type="text"
                    value={dateLabel}
                    onChange={(e) => setDateLabel(e.target.value)}
                    className="w-full border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus:border-brand bg-white dark:text-cream dark:border-cream/40 dark:bg-deep"
                    placeholder="Ej. Quito, agosto de 2026"
                  />
                </PixelField>

                <PixelField label="Color">
                  <PixelSegmented options={THEME_OPTIONS} value={theme} onChange={setTheme} />
                </PixelField>

                <PixelField label="Tipografía" hint="Cada tarjeta muestra el nombre escrito en esa fuente.">
                  <FontPicker value={font} onChange={setFont} />
                </PixelField>

                <PixelField label="Tamaño de letra">
                  <PixelSegmented options={TEXT_SIZE_OPTIONS} value={textSize} onChange={setTextSize} />
                </PixelField>

                <PixelField label="Fondo decorativo" hint="Un patrón muy sutil detrás del texto — no afecta la lectura ni la impresión.">
                  <PixelSegmented options={BACKGROUND_OPTIONS} value={background} onChange={setBackground} />
                </PixelField>
              </CollapsibleSection>

              <PixelButton onClick={handleGenerate}>
                ✨ Generar {count || ''} certificado{count === 1 ? '' : 's'}
              </PixelButton>

              {names && (
                <PixelButton variant="secondary" onClick={handlePrint}>
                  🖨️ Imprimir / Guardar como PDF
                </PixelButton>
              )}

              <AuriNote line={auriLine} />
            </PixelPanel>

            {/* Vista previa — pegada (sticky) para que no se pierda cuando el
                formulario de la izquierda es más largo que ella. */}
            <div className="min-w-0 lg:sticky lg:top-6 self-start">
              {!names && (
                <div className="no-print">
                  <EmptyPreview>Tus certificados van a aparecer aquí, uno por estudiante.</EmptyPreview>
                </div>
              )}

              {names && names.length > 0 && (
                <>
                  {names.length > 1 && (
                    <div className="no-print flex items-center justify-center gap-3 mb-4">
                      <button
                        onClick={() => setPreviewIndex((i) => Math.max(0, i - 1))}
                        disabled={previewIndex === 0}
                        className="w-8 h-8 border-2 border-deep bg-white text-deep disabled:opacity-30 hover:bg-cream dark:text-cream dark:border-cream/40 dark:bg-deep dark:hover:bg-cream/10"
                        aria-label="Certificado anterior"
                      >
                        ◀
                      </button>
                      <span className="font-label text-[9px] tracking-wide text-deep/60">
                        VISTA PREVIA — CERTIFICADO {previewIndex + 1} DE {names.length}
                      </span>
                      <button
                        onClick={() => setPreviewIndex((i) => Math.min(names.length - 1, i + 1))}
                        disabled={previewIndex === names.length - 1}
                        className="w-8 h-8 border-2 border-deep bg-white text-deep disabled:opacity-30 hover:bg-cream dark:text-cream dark:border-cream/40 dark:bg-deep dark:hover:bg-cream/10"
                        aria-label="Certificado siguiente"
                      >
                        ▶
                      </button>
                    </div>
                  )}

                  <div className="printable">
                    {names.map((name, i) => (
                      <div
                        key={`${name}-${i}`}
                        className={`bg-white border-4 ${t.border} p-3 sm:p-5 aspect-[1.414/1] ${
                          i === previewIndex ? '' : 'hidden print:flex'
                        } print:flex`}
                        style={i > 0 ? { breakBefore: 'page' } : undefined}
                      >
                        <div className={`relative w-full h-full border-2 border-dashed ${t.innerBorder} flex flex-col items-center justify-between text-center px-6 sm:px-10 py-6 sm:py-8`}>
                          <CertificateBackground background={background} />

                          {/* Esquinas decorativas, estilo pixel */}
                          <span className={`absolute top-2 left-2 text-lg ${t.corner} z-10`} aria-hidden="true">✦</span>
                          <span className={`absolute top-2 right-2 text-lg ${t.corner} z-10`} aria-hidden="true">✦</span>
                          <span className={`absolute bottom-2 left-2 text-lg ${t.corner} z-10`} aria-hidden="true">✦</span>
                          <span className={`absolute bottom-2 right-2 text-lg ${t.corner} z-10`} aria-hidden="true">✦</span>

                          <div className="w-full relative z-10">
                            {showHeaderRow && (
                              <div className="w-full flex items-center justify-between gap-3 mb-3 sm:mb-4">
                                <div className={`${logoBoxClass} flex items-center justify-start shrink-0`}>
                                  {logo1 && <img src={logo1.dataUrl} alt="" className="max-h-full max-w-full object-contain" />}
                                </div>
                                <div className="flex-1 flex flex-col items-center gap-0.5">
                                  {activeHeaderLines.map((line, idx) => (
                                    <p
                                      key={line.id}
                                      className="tracking-[0.15em] text-deep/70"
                                      style={textStyle(BASE_PX.headerLine[Math.min(idx, BASE_PX.headerLine.length - 1)])}
                                    >
                                      {line.text}
                                    </p>
                                  ))}
                                </div>
                                <div className={`${logoBoxClass} flex items-center justify-end shrink-0`}>
                                  {logo2 && <img src={logo2.dataUrl} alt="" className="max-h-full max-w-full object-contain" />}
                                </div>
                              </div>
                            )}
                            <h2
                              className={`font-semibold ${t.text} mb-4 sm:mb-6`}
                              style={textStyle(BASE_PX.title)}
                            >
                              Certificado de {typeCfg.label}
                            </h2>
                            <p className="text-deep/60 mb-1" style={textStyle(BASE_PX.intro)}>
                              Se certifica que
                            </p>
                            <p
                              className="text-deep font-semibold mb-3 sm:mb-5 break-words"
                              style={textStyle(BASE_PX.name)}
                            >
                              {name}
                            </p>
                            {customBody.trim() ? (
                              <p className="text-deep/70 max-w-md mx-auto leading-relaxed" style={textStyle(BASE_PX.body)}>
                                {customBody}
                              </p>
                            ) : (
                              <p className="text-deep/70 max-w-md mx-auto leading-relaxed" style={textStyle(BASE_PX.body)}>
                                {typeCfg.verb}{' '}
                                <span className="font-semibold text-deep">
                                  "{courseName || 'el curso indicado'}"
                                </span>
                                {hours ? `, con una duración de ${hours} horas académicas` : ''}.
                              </p>
                            )}
                          </div>

                          <div className="w-full flex items-end justify-between gap-6 mt-4 relative z-10">
                            <div className="flex-1 text-left">
                              {dateLabel && (
                                <p className="text-deep/50 mb-1" style={textStyle(BASE_PX.footer)}>
                                  {dateLabel}
                                </p>
                              )}
                              {includeCode && (
                                <p className="text-deep/50" style={textStyle(BASE_PX.footer)}>
                                  N.º {buildCode(codePrefix, i)}
                                </p>
                              )}
                            </div>

                            <div className="flex-1 flex items-end justify-center gap-8">
                              {signer1Name && (
                                <div className="text-center">
                                  {signer1Signature && (
                                    <img
                                      src={signer1Signature.dataUrl}
                                      alt=""
                                      className={`${signatureImgClass} max-w-[140px] object-contain mx-auto mb-1`}
                                    />
                                  )}
                                  <p className="text-deep border-t border-deep pt-1 px-3" style={textStyle(BASE_PX.signerName)}>
                                    {signer1Name}
                                  </p>
                                  <p className="text-deep/50" style={textStyle(BASE_PX.signerRole)}>
                                    {signer1Role}
                                  </p>
                                </div>
                              )}
                              {includeSigner2 && signer2Name && (
                                <div className="text-center">
                                  {signer2Signature && (
                                    <img
                                      src={signer2Signature.dataUrl}
                                      alt=""
                                      className={`${signatureImgClass} max-w-[140px] object-contain mx-auto mb-1`}
                                    />
                                  )}
                                  <p className="text-deep border-t border-deep pt-1 px-3" style={textStyle(BASE_PX.signerName)}>
                                    {signer2Name}
                                  </p>
                                  <p className="text-deep/50" style={textStyle(BASE_PX.signerRole)}>
                                    {signer2Role}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex-1" aria-hidden="true" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </PageContainer>
      </section>

      <div className="no-print">
        <Footer />
      </div>
    </div>
  )
}