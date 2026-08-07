import { useState, useRef } from 'react'
import { Navbar, Footer, PageContainer } from '../../../components/layout'
import { PixelButton, PixelInput } from '../../../components/ui'
import { PixelPanel, PixelField, EmptyPreview } from '../components'

// Rotación absoluta (normalizada 0–360) que hay que aplicar al cubo para
// que cada cara quede mirando al frente. El orden coincide con el orden
// físico de las caras del dado: 0 frente, 1 derecha, 2 atrás, 3 izquierda,
// 4 arriba, 5 abajo.
const FACE_TARGETS = [
  { x: 0, y: 0 },
  { x: 0, y: 270 },
  { x: 0, y: 180 },
  { x: 0, y: 90 },
  { x: 270, y: 0 },
  { x: 90, y: 0 },
]

const DEFAULT_FACES = ['1', '2', '3', '4', '5', '6']

function makeDie(id) {
  return { id, name: '', faces: [...DEFAULT_FACES], rotX: 0, rotY: 0, faceIndex: 0 }
}

// Bordes del molde: sólido en el contorno exterior de la cruz, punteado
// en los pliegues internos (donde una cara se dobla contra la vecina).
const NET_BORDERS = {
  top:    { borderTop: '2px solid #1B1E3A', borderLeft: '2px solid #1B1E3A', borderRight: '2px solid #1B1E3A', borderBottom: '2px dashed #1B1E3A80' },
  left:   { borderTop: '2px solid #1B1E3A', borderLeft: '2px solid #1B1E3A', borderBottom: '2px solid #1B1E3A', borderRight: '2px dashed #1B1E3A80' },
  front:  { borderTop: '2px dashed #1B1E3A80', borderLeft: '2px dashed #1B1E3A80', borderRight: '2px dashed #1B1E3A80', borderBottom: '2px dashed #1B1E3A80' },
  right:  { borderTop: '2px solid #1B1E3A', borderBottom: '2px solid #1B1E3A', borderLeft: '2px dashed #1B1E3A80', borderRight: '2px dashed #1B1E3A80' },
  back:   { borderTop: '2px solid #1B1E3A', borderBottom: '2px solid #1B1E3A', borderRight: '2px solid #1B1E3A', borderLeft: '2px dashed #1B1E3A80' },
  bottom: { borderTop: '2px dashed #1B1E3A80', borderLeft: '2px solid #1B1E3A', borderRight: '2px solid #1B1E3A', borderBottom: '2px solid #1B1E3A' },
}

export default function Dados() {
  const [title, setTitle] = useState('')
  const [dice, setDice] = useState([makeDie(1)])
  const nextId = useRef(2)

  const addDie = () => setDice([...dice, makeDie(nextId.current++)])
  const removeDie = (id) => setDice(dice.filter((d) => d.id !== id))

  const updateDieName = (id, name) =>
    setDice(dice.map((d) => (d.id === id ? { ...d, name } : d)))

  const updateFace = (id, faceIdx, value) =>
    setDice(
      dice.map((d) =>
        d.id === id ? { ...d, faces: d.faces.map((f, i) => (i === faceIdx ? value : f)) } : d
      )
    )

  const rollDie = (id) => {
    setDice(
      dice.map((d) => {
        if (d.id !== id) return d
        let idx = Math.floor(Math.random() * 6)
        // Evitamos que "ruede" y caiga exactamente en la misma cara —
        // se siente más a dado real si al menos cambia de cara.
        if (idx === d.faceIndex) idx = (idx + 1) % 6
        const spins = 2 + Math.floor(Math.random() * 2) // 2–3 vueltas completas
        const target = FACE_TARGETS[idx]
        const baseX = d.rotX - (d.rotX % 360)
        const baseY = d.rotY - (d.rotY % 360)
        return {
          ...d,
          faceIndex: idx,
          rotX: baseX + spins * 360 + target.x,
          rotY: baseY + spins * 360 + target.y,
        }
      })
    )
  }

  const rollAll = () => dice.forEach((d) => rollDie(d.id))

  const hasContent = dice.some((d) => d.faces.some((f) => f.trim() !== ''))

  return (
    <div className="min-h-screen bg-cream/30 dark:bg-deep flex flex-col">
      <style>{`
        @media print {
          body { background-color: white !important; }
          .hide-on-print { display: none !important; }
          .show-on-print { display: block !important; }
          .print-clean-container { border: none !important; box-shadow: none !important; padding: 0 !important; background: white !important; }
          .print-full-width { display: block !important; width: 100% !important; margin: 0 !important; }
          .print-net-box { page-break-inside: avoid; margin: 0 auto 40px auto; }
        }
        @media screen {
          .show-on-print { display: none !important; }
        }
      `}</style>

      <div className="hide-on-print">
        <Navbar backHref="#/laboratorio" backLabel="LABORATORIO" />
      </div>

      <main className="flex-1 py-8">
        <PageContainer>
          <div className="text-center mb-10 no-print hide-on-print">
            <p className="font-label text-[10px] tracking-widest text-brand mb-4">🎲 GENERADOR</p>
            <h1 className="font-display text-4xl text-deep font-semibold mb-3 dark:text-cream">Dados</h1>
            <p className="text-deep/70 max-w-md mx-auto dark:text-cream/70">
              Crea dados personalizados: cada cara puede llevar una palabra, una pregunta o un emoji.
              Actívalos digitalmente o imprime el molde para armarlos en papel.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start print-full-width">
            {/* PANEL IZQUIERDO: FORMULARIO */}
            <div className="lg:col-span-4 space-y-6 hide-on-print">
              <PixelPanel title="MÁQUINA DE DADOS" icon="🎲">
                <div className="space-y-6">
                  <PixelField label="Título de la actividad" htmlFor="title">
                    <PixelInput
                      id="title"
                      placeholder="Ej. Dado de los tiempos verbales..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </PixelField>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="font-label text-[10px] tracking-widest text-deep">TUS DADOS</label>
                      <span className="font-label text-[10px] text-deep/50">{dice.length} EN TOTAL</span>
                    </div>

                    <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
                      {dice.map((die, dIdx) => (
                        <div key={die.id} className="relative bg-white border-2 border-deep p-4 shadow-pixel-sm">
                          {dice.length > 1 && (
                            <button
                              onClick={() => removeDie(die.id)}
                              className="absolute -top-2 -right-2 bg-ember w-6 h-6 border-2 border-deep text-white flex items-center justify-center hover:scale-110 transition-transform focus:outline-none"
                              aria-label="Eliminar dado"
                            >
                              <span className="text-xs leading-none mt-[-2px]">x</span>
                            </button>
                          )}

                          <PixelInput
                            placeholder={`Nombre del dado ${dIdx + 1} (opcional)`}
                            value={die.name}
                            onChange={(e) => updateDieName(die.id, e.target.value)}
                            className="mb-3"
                          />

                          <div className="grid grid-cols-2 gap-2">
                            {die.faces.map((face, fIdx) => (
                              <div key={fIdx}>
                                <label className="block text-[10px] font-bold text-deep/60 mb-1">
                                  CARA {fIdx + 1}
                                </label>
                                <PixelInput
                                  placeholder="Ej. 🐶"
                                  value={face}
                                  onChange={(e) => updateFace(die.id, fIdx, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={addDie}
                      className="w-full border-2 border-dashed border-deep/40 text-deep/60 py-3 font-semibold hover:border-deep hover:text-deep hover:bg-white transition-colors focus:outline-none dark:text-cream/60 dark:border-cream/40 dark:hover:bg-cream/10 dark:hover:border-cream dark:hover:text-cream"
                    >
                      + AGREGAR OTRO DADO
                    </button>
                  </div>
                </div>
              </PixelPanel>
            </div>

            {/* PANEL DERECHO: VISTA DIGITAL Y DE IMPRESIÓN */}
            <div className="lg:col-span-8 print-full-width">
              {!hasContent ? (
                <div className="h-full min-h-[500px] hide-on-print">
                  <EmptyPreview>
                    Escribe algo en al menos una cara para ver tus dados cobrar vida aquí.
                  </EmptyPreview>
                </div>
              ) : (
                <div className="bg-white border-2 border-deep p-8 shadow-pixel min-h-[500px] print-clean-container">
                  {/* Cabecera Digital */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b-2 border-deep/10 hide-on-print">
                    <div>
                      <h2 className="font-display text-2xl font-semibold text-deep">
                        {title || 'Mis dados'}
                      </h2>
                      <p className="text-sm text-deep/60">Haz clic en un dado para lanzarlo.</p>
                    </div>

                    <div className="w-full sm:w-auto shrink-0 flex flex-wrap gap-3">
                      <PixelButton variant="secondary" onClick={rollAll}>
                        🎲 Lanzar todos
                      </PixelButton>
                      <PixelButton variant="primary" onClick={() => window.print()}>
                        🖨️ Imprimir molde
                      </PixelButton>
                    </div>
                  </div>

                  {/* VISTA 3D EN PANTALLA */}
                  <div className="flex flex-wrap justify-center gap-10 py-6 hide-on-print">
                    {dice
                      .filter((d) => d.faces.some((f) => f.trim()))
                      .map((die) => (
                        <div key={die.id} className="flex flex-col items-center gap-4">
                          <div
                            role="button"
                            tabIndex={0}
                            aria-label={`Lanzar dado ${die.name || ''}`}
                            className="relative w-28 h-28 [perspective:800px] cursor-pointer focus:outline-none"
                            onClick={() => rollDie(die.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                rollDie(die.id)
                              }
                            }}
                          >
                            <div
                              className="absolute inset-0 [transform-style:preserve-3d] transition-transform duration-700 ease-out"
                              style={{ transform: `rotateX(${die.rotX}deg) rotateY(${die.rotY}deg)` }}
                            >
                              {[
                                { face: 0, t: 'translateZ(56px)' },
                                { face: 1, t: 'rotateY(90deg) translateZ(56px)' },
                                { face: 2, t: 'rotateY(180deg) translateZ(56px)' },
                                { face: 3, t: 'rotateY(-90deg) translateZ(56px)' },
                                { face: 4, t: 'rotateX(90deg) translateZ(56px)' },
                                { face: 5, t: 'rotateX(-90deg) translateZ(56px)' },
                              ].map(({ face, t }) => (
                                <div
                                  key={face}
                                  className="absolute inset-0 bg-white border-2 border-deep shadow-pixel-sm flex items-center justify-center text-2xl font-display font-semibold text-deep [backface-visibility:hidden]"
                                  style={{ transform: t }}
                                >
                                  {die.faces[face] || '·'}
                                </div>
                              ))}
                            </div>
                          </div>
                          <span className="font-label text-[10px] tracking-wide text-deep/60 text-center">
                            {die.name || 'Dado sin nombre'}
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* VISTA SOLO PARA LA IMPRESORA: molde en cruz para armar */}
                  <div className="show-on-print">
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                      <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'black', margin: 0 }}>
                        {title || 'Mis dados'}
                      </h2>
                      <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                        Recorta por el contorno sólido, dobla por las líneas punteadas y pega las
                        caras con cinta para armar el dado.
                      </p>
                    </div>

                    {dice
                      .filter((d) => d.faces.some((f) => f.trim()))
                      .map((die) => (
                        <div key={`print-${die.id}`} className="print-net-box">
                          {die.name && (
                            <p style={{ textAlign: 'center', fontSize: '13px', marginBottom: '8px', color: 'black' }}>
                              {die.name}
                            </p>
                          )}
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(4, 90px)',
                              gridTemplateRows: 'repeat(3, 90px)',
                              justifyContent: 'center',
                            }}
                          >
                            <div />
                            <div style={{ ...NET_BORDERS.top, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: 'black' }}>{die.faces[4]}</div>
                            <div />
                            <div />

                            <div style={{ ...NET_BORDERS.left, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: 'black' }}>{die.faces[3]}</div>
                            <div style={{ ...NET_BORDERS.front, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: 'black' }}>{die.faces[0]}</div>
                            <div style={{ ...NET_BORDERS.right, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: 'black' }}>{die.faces[1]}</div>
                            <div style={{ ...NET_BORDERS.back, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: 'black' }}>{die.faces[2]}</div>

                            <div />
                            <div style={{ ...NET_BORDERS.bottom, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: 'black' }}>{die.faces[5]}</div>
                            <div />
                            <div />
                          </div>
                        </div>
                      ))}

                    {dice.some((d) => d.faces.some((f) => !f.trim())) && (
                      <p style={{ textAlign: 'center', fontSize: '11px', color: '#999', marginTop: '12px' }}>
                        * Las caras vacías se imprimen en blanco — puedes escribirlas a mano sobre el
                        molde de papel.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </PageContainer>
      </main>

      <div className="hide-on-print">
        <Footer />
      </div>
    </div>
  )
}
