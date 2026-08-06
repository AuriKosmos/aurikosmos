import { useState } from 'react'
import { PixelCheckbox, PixelSegmented, PixelButton } from '../../../components/ui'
import { AuriNote } from '../../../components/auri'
import { PixelPanel, PixelField, EmptyPreview } from '../components'
import { Navbar, Footer, PageContainer } from '../../../components/layout'

const AURI_LINES = [
  '¡Qué lindo momento para tus estudiantes!',
  'Un diploma bien hecho se guarda para siempre.',
  '¿Imprimimos uno de prueba primero?',
  'Me encanta reconocer el esfuerzo.',
]

const EXAMPLE_NAMES = 'María José Andrade\nCarlos Mendoza\nSofía Vera\nMateo Chávez\nEmilia Torres'

const DEFAULT_REASON =
  'Por su destacado esfuerzo, dedicación y compromiso durante el año lectivo.'

// Temas de color — reutilizan la paleta de marca (ver tailwind.config.js),
// para que el diploma se sienta parte de Auri Kosmos y no un elemento suelto.
const THEMES = {
  brand: {
    label: 'Morado',
    border: 'border-brand',
    innerBorder: 'border-brand/30',
    text: 'text-brand',
    seal: 'bg-brand',
    corner: 'text-brand',
  },
  mint: {
    label: 'Verde',
    border: 'border-mint',
    innerBorder: 'border-mint/40',
    text: 'text-deep',
    seal: 'bg-mint',
    corner: 'text-mint',
  },
  sun: {
    label: 'Dorado',
    border: 'border-sun',
    innerBorder: 'border-sun/40',
    text: 'text-deep',
    seal: 'bg-sun',
    corner: 'text-sun',
  },
  blossom: {
    label: 'Rosa',
    border: 'border-blossom',
    innerBorder: 'border-blossom/50',
    text: 'text-deep',
    seal: 'bg-blossom',
    corner: 'text-blossom',
  },
}
const THEME_OPTIONS = Object.entries(THEMES).map(([value, cfg]) => ({ value, label: cfg.label }))

function parseNames(raw) {
  return raw
    .split('\n')
    .map((n) => n.trim())
    .filter((n) => n.length > 0)
}

export default function Diplomas() {
  const [namesInput, setNamesInput] = useState(EXAMPLE_NAMES)
  const [diplomaTitle, setDiplomaTitle] = useState('Diploma al Mérito')
  const [reason, setReason] = useState(DEFAULT_REASON)
  const [institution, setInstitution] = useState('')
  const [signer1Name, setSigner1Name] = useState('')
  const [signer1Role, setSigner1Role] = useState('Docente')
  const [includeSigner2, setIncludeSigner2] = useState(false)
  const [signer2Name, setSigner2Name] = useState('')
  const [signer2Role, setSigner2Role] = useState('Director/a')
  const [dateLabel, setDateLabel] = useState('')
  const [theme, setTheme] = useState('brand')

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
  }

  function handleClear() {
    setNamesInput('')
  }

  const t = THEMES[theme]

  return (
    <div className="min-h-screen bg-white">
      {/* Fuerza orientación horizontal solo mientras esta página está montada
          — un diploma se lee mejor apaisado que en una hoja vertical. */}
      <style>{'@media print { @page { size: landscape; } }'}</style>

      <Navbar backHref="#/laboratorio" backLabel="LABORATORIO" />

      <section className="pb-24">
        <PageContainer>
          <div className="text-center mb-8 sm:mb-10 no-print px-2">
            <p className="font-label text-[10px] tracking-widest text-brand mb-4">🎓 GENERADOR</p>
            <h1 className="font-display text-3xl sm:text-4xl text-deep font-semibold mb-3">Diplomas</h1>
            <p className="text-deep/70 max-w-md mx-auto text-sm sm:text-base">
              Escribe la lista de estudiantes y el motivo del reconocimiento — genera un diploma
              listo para imprimir por cada uno, con su nombre ya puesto.
            </p>
          </div>

          <div className="grid lg:grid-cols-[340px_1fr] gap-6 sm:gap-8 items-start">
            <PixelPanel title="MÁQUINA DE DIPLOMAS" icon="🎓">
              <PixelField
                label="Estudiantes (uno por línea)"
                hint="Cada nombre se convierte en un diploma aparte, en el mismo orden."
              >
                <textarea
                  value={namesInput}
                  onChange={(e) => setNamesInput(e.target.value)}
                  rows={6}
                  className="w-full border-2 border-deep p-3 font-body text-sm text-deep focus:outline-none focus:border-brand resize-none bg-white"
                  placeholder={'María José Andrade\nCarlos Mendoza'}
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

              <PixelField label="Título del diploma">
                <input
                  type="text"
                  value={diplomaTitle}
                  onChange={(e) => setDiplomaTitle(e.target.value)}
                  className="w-full border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus:border-brand bg-white"
                  placeholder="Diploma al Mérito"
                />
              </PixelField>

              <PixelField
                label="Motivo del reconocimiento"
                hint="No hace falta repetir el nombre — ya aparece arriba de este texto en el diploma."
              >
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full border-2 border-deep p-3 font-body text-sm text-deep focus:outline-none focus:border-brand resize-none bg-white"
                />
              </PixelField>

              <PixelField label="Institución / curso (opcional)">
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus:border-brand bg-white"
                  placeholder="Ej. Unidad Educativa Los Andes — 5to de Básica"
                />
              </PixelField>

              <PixelField label="Fecha o lugar y fecha (opcional)">
                <input
                  type="text"
                  value={dateLabel}
                  onChange={(e) => setDateLabel(e.target.value)}
                  className="w-full border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus:border-brand bg-white"
                  placeholder="Ej. Quito, agosto de 2026"
                />
              </PixelField>

              <PixelField label="Firma 1">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={signer1Name}
                    onChange={(e) => setSigner1Name(e.target.value)}
                    className="w-full border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus:border-brand bg-white"
                    placeholder="Nombre"
                  />
                  <input
                    type="text"
                    value={signer1Role}
                    onChange={(e) => setSigner1Role(e.target.value)}
                    className="w-full border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus:border-brand bg-white"
                    placeholder="Cargo"
                  />
                </div>
              </PixelField>

              <PixelField>
                <PixelCheckbox checked={includeSigner2} onChange={(e) => setIncludeSigner2(e.target.checked)}>
                  Agregar una segunda firma
                </PixelCheckbox>
                {includeSigner2 && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <input
                      type="text"
                      value={signer2Name}
                      onChange={(e) => setSigner2Name(e.target.value)}
                      className="w-full border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus:border-brand bg-white"
                      placeholder="Nombre"
                    />
                    <input
                      type="text"
                      value={signer2Role}
                      onChange={(e) => setSigner2Role(e.target.value)}
                      className="w-full border-2 border-deep p-2.5 font-body text-sm text-deep focus:outline-none focus:border-brand bg-white"
                      placeholder="Cargo"
                    />
                  </div>
                )}
              </PixelField>

              <PixelField label="Color">
                <PixelSegmented options={THEME_OPTIONS} value={theme} onChange={setTheme} />
              </PixelField>

              <PixelButton onClick={handleGenerate}>
                ✨ Generar {parseNames(namesInput).length || ''} diploma
                {parseNames(namesInput).length === 1 ? '' : 's'}
              </PixelButton>

              {names && (
                <PixelButton variant="secondary" onClick={handlePrint}>
                  🖨️ Imprimir / Guardar como PDF
                </PixelButton>
              )}

              <AuriNote line={auriLine} />
            </PixelPanel>

            {/* Vista previa / Hoja imprimible */}
            <div className="min-w-0">
              {!names && (
                <div className="no-print">
                  <EmptyPreview>Tus diplomas van a aparecer aquí, uno por estudiante.</EmptyPreview>
                </div>
              )}

              {names && names.length > 0 && (
                <>
                  {names.length > 1 && (
                    <div className="no-print flex items-center justify-center gap-3 mb-4">
                      <button
                        onClick={() => setPreviewIndex((i) => Math.max(0, i - 1))}
                        disabled={previewIndex === 0}
                        className="w-8 h-8 border-2 border-deep bg-white text-deep disabled:opacity-30 hover:bg-cream"
                        aria-label="Diploma anterior"
                      >
                        ◀
                      </button>
                      <span className="font-label text-[9px] tracking-wide text-deep/60">
                        VISTA PREVIA — DIPLOMA {previewIndex + 1} DE {names.length}
                      </span>
                      <button
                        onClick={() => setPreviewIndex((i) => Math.min(names.length - 1, i + 1))}
                        disabled={previewIndex === names.length - 1}
                        className="w-8 h-8 border-2 border-deep bg-white text-deep disabled:opacity-30 hover:bg-cream"
                        aria-label="Diploma siguiente"
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
                          {/* Esquinas decorativas, estilo pixel */}
                          <span className={`absolute top-2 left-2 text-lg ${t.corner}`} aria-hidden="true">✦</span>
                          <span className={`absolute top-2 right-2 text-lg ${t.corner}`} aria-hidden="true">✦</span>
                          <span className={`absolute bottom-2 left-2 text-lg ${t.corner}`} aria-hidden="true">✦</span>
                          <span className={`absolute bottom-2 right-2 text-lg ${t.corner}`} aria-hidden="true">✦</span>

                          <div className="w-full">
                            <p className="font-label text-[9px] sm:text-[10px] tracking-[0.25em] text-deep/50 mb-3 sm:mb-4">
                              AURI KOSMOS{institution ? ` · ${institution.toUpperCase()}` : ''}
                            </p>
                            <h2 className={`font-display text-2xl sm:text-4xl font-semibold ${t.text} mb-4 sm:mb-6`}>
                              {diplomaTitle}
                            </h2>
                            <p className="text-xs sm:text-sm text-deep/60 mb-1">Se otorga el presente diploma a</p>
                            <p className="font-display text-xl sm:text-3xl text-deep font-semibold mb-3 sm:mb-5 break-words">
                              {name}
                            </p>
                            <p className="text-xs sm:text-sm text-deep/70 max-w-md mx-auto leading-relaxed">
                              {reason}
                            </p>
                          </div>

                          <div className="w-full flex items-end justify-between gap-6 mt-4">
                            <div className="flex-1 text-left">
                              {dateLabel && <p className="text-[10px] sm:text-xs text-deep/50">{dateLabel}</p>}
                            </div>

                            <div className="flex-1 flex items-end justify-center gap-8">
                              {signer1Name && (
                                <div className="text-center">
                                  <p className="text-xs sm:text-sm text-deep border-t border-deep pt-1 px-3">
                                    {signer1Name}
                                  </p>
                                  <p className="text-[9px] sm:text-[10px] text-deep/50">{signer1Role}</p>
                                </div>
                              )}
                              {includeSigner2 && signer2Name && (
                                <div className="text-center">
                                  <p className="text-xs sm:text-sm text-deep border-t border-deep pt-1 px-3">
                                    {signer2Name}
                                  </p>
                                  <p className="text-[9px] sm:text-[10px] text-deep/50">{signer2Role}</p>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 flex justify-end">
                              <span className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${t.seal} flex items-center justify-center text-white text-lg shrink-0`} aria-hidden="true">
                                🐧
                              </span>
                            </div>
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

      <Footer />
    </div>
  )
}