import { useState, useRef } from 'react'
import { Navbar, Footer, PageContainer } from '../../../components/layout'
import { PixelButton, PixelInput } from '../../../components/ui'
import { PixelPanel, PixelField, EmptyPreview } from '../components'

export default function Flashcards() {
  const [title, setTitle] = useState('')
  
  const [cards, setCards] = useState([
    { id: 1, front: '', back: '', isFlipped: false },
    { id: 2, front: '', back: '', isFlipped: false },
    { id: 3, front: '', back: '', isFlipped: false },
  ])

  // Usar un contador confiable para los IDs evita errores si se borran todas las tarjetas
  const nextId = useRef(4)

  const addCard = () => {
    setCards([...cards, { id: nextId.current++, front: '', back: '', isFlipped: false }])
  }

  const updateCard = (id, field, value) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, [field]: value } : card
    ))
  }

  const removeCard = (id) => {
    setCards(cards.filter(card => card.id !== id))
  }

  const toggleFlip = (id) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, isFlipped: !card.isFlipped } : card
    ))
  }

  const shuffleCards = () => {
    // Algoritmo de Fisher-Yates para mezclar el arreglo de forma aleatoria
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setCards(shuffled);
  }

  // Verifica que el texto no sean solo espacios en blanco
  const hasContent = cards.some(c => c.front.trim() !== '' || c.back.trim() !== '')

  return (
    <div className="min-h-screen bg-cream/30 dark:bg-deep flex flex-col">
      
      {/* 🚀 CSS A PRUEBA DE BALAS PARA LA IMPRESORA */}
      <style>{`
        @media print {
          body { background-color: white !important; }
          .hide-on-print { display: none !important; }
          .show-on-print { display: block !important; }
          .print-clean-container { border: none !important; box-shadow: none !important; padding: 0 !important; background: white !important; }
          
          /* Rompemos la grilla para que las tarjetas usen el 100% de la hoja A4 */
          .print-full-width { display: block !important; width: 100% !important; margin: 0 !important; }
          
          /* Bordes más claros para recortar y doblar */
          .print-card-box { 
            page-break-inside: avoid; 
            margin-bottom: 24px; 
            display: flex; 
            width: 100%; 
            border: 1px solid #ccc; /* Línea suave para recortar */
          }
          .print-card-half { 
            width: 50%; 
            padding: 32px 24px; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            text-align: center; 
            min-height: 200px; /* Un poco más alto para formato A4 */
          }
          .print-dashed-line { 
            border-right: 2px dashed #999; /* Línea de doblez */
          }
        }
        @media screen {
          .show-on-print { display: none !important; }
        }
      `}</style>

      {/* Ocultamos Navbar en impresión */}
      <div className="hide-on-print">
        <Navbar backHref="#/laboratorio" backLabel="LABORATORIO" />
      </div>

      <main className="flex-1 py-8" style={{ paddingTop: '2rem' }}>
        <PageContainer>
          <div className="text-center mb-10 no-print hide-on-print">
            <p className="font-label text-[10px] tracking-widest text-brand mb-4">🃏 GENERADOR</p>
            <h1 className="font-display text-4xl text-deep font-semibold mb-3 dark:text-cream">Flashcards</h1>
            <p className="text-deep/70 max-w-md mx-auto dark:text-cream/70">
              Crea tarjetas de estudio interactivas. Escribe el concepto de un lado y la definición del otro.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start print-full-width">
            
            {/* PANEL IZQUIERDO: FORMULARIO */}
            <div className="lg:col-span-4 space-y-6 hide-on-print">
              <PixelPanel title="MÁQUINA DE FLASHCARDS" icon="🃏">
                <div className="space-y-6">
                  <PixelField label="Título de la actividad" htmlFor="title">
                    <PixelInput
                      id="title"
                      placeholder="Ej. Vocabulario de la computadora..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </PixelField>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="font-label text-[10px] tracking-widest text-deep">TUS TARJETAS</label>
                      <span className="font-label text-[10px] text-deep/50">{cards.length} EN TOTAL</span>
                    </div>

                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                      {cards.map((card, index) => (
                        <div key={card.id} className="relative bg-white border-2 border-deep p-4 shadow-pixel-sm">
                          <button
                            onClick={() => removeCard(card.id)}
                            className="absolute -top-2 -right-2 bg-ember w-6 h-6 border-2 border-deep text-white flex items-center justify-center hover:scale-110 transition-transform focus:outline-none"
                            aria-label="Eliminar tarjeta"
                          >
                            <span className="text-xs leading-none mt-[-2px]">x</span>
                          </button>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold text-deep/60 mb-1">
                                {index + 1}. FRENTE (Pregunta/Concepto)
                              </label>
                              <PixelInput
                                placeholder="Ej. Hardware"
                                value={card.front}
                                onChange={(e) => updateCard(card.id, 'front', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-deep/60 mb-1">
                                REVERSO (Respuesta/Definición)
                              </label>
                              <textarea
                                className="w-full bg-white border-2 border-deep px-3 py-2 text-deep focus:outline-none focus:ring-2 focus:ring-sky/50 resize-none h-20 text-sm dark:text-cream dark:border-cream/40 dark:bg-deep"
                                placeholder="Parte física de la computadora..."
                                value={card.back}
                                onChange={(e) => updateCard(card.id, 'back', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={addCard}
                      className="w-full border-2 border-dashed border-deep/40 text-deep/60 py-3 font-semibold hover:border-deep hover:text-deep hover:bg-white transition-colors focus:outline-none dark:text-cream/60 dark:border-cream/40 dark:hover:bg-cream/10 dark:hover:border-cream dark:hover:text-cream"
                    >
                      + AGREGAR OTRA TARJETA
                    </button>
                  </div>
                </div>
              </PixelPanel>
            </div>

            {/* PANEL DERECHO: VISTA DIGITAL Y DE IMPRESIÓN */}
            <div className="lg:col-span-8 print-full-width">
              {!hasContent ? (
                <div className="h-full min-h-[500px] hide-on-print">
                  <EmptyPreview 
                    title="Lienzo en blanco" 
                    desc="Empieza a escribir tus conceptos en el panel de la izquierda para ver cómo cobran vida tus tarjetas."
                  />
                </div>
              ) : (
                <div className="bg-white border-2 border-deep p-8 shadow-pixel min-h-[500px] print-clean-container">
                  
                  {/* Cabecera Digital */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b-2 border-deep/10 hide-on-print">
                    <div>
                      <h2 className="font-display text-2xl font-semibold text-deep">
                        {title || 'Tarjetas de Estudio'}
                      </h2>
                      <p className="text-sm text-deep/60">Haz clic en las tarjetas para girarlas.</p>
                    </div>
                    
                    {/* Contenedor de botones */}
                    <div className="w-full sm:w-auto shrink-0 flex flex-wrap gap-3">
                      <PixelButton variant="secondary" onClick={shuffleCards}>
                        🔀 Mezclar
                      </PixelButton>
                      
                      <PixelButton variant="primary" onClick={() => window.print()}>
                        🖨️ Imprimir
                      </PixelButton>
                    </div>
                  </div>

                  {/* VISTA 3D EN PANTALLA */}
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 hide-on-print">
                    {cards.filter(c => c.front.trim() || c.back.trim()).map((card) => (
                      <div 
                        key={card.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`Girar tarjeta: ${card.front || 'Vacía'}`}
                        className="relative w-full h-48 [perspective:1000px] cursor-pointer group focus:outline-none focus:ring-4 focus:ring-sky/50 rounded-md"
                        onClick={() => toggleFlip(card.id)}
                        onKeyDown={(e) => {
                          // Accesibilidad por teclado
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleFlip(card.id);
                          }
                        }}
                      >
                        <div className={`w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${card.isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                          <div className="absolute inset-0 bg-white border-2 border-deep shadow-pixel-sm p-5 flex flex-col items-center justify-center text-center [backface-visibility:hidden] group-hover:border-sky transition-colors">
                            <span className="absolute top-2 left-2 text-[10px] font-bold text-deep/40">FRENTE</span>
                            <p className="font-display font-semibold text-xl text-deep break-words">{card.front || '...'}</p>
                          </div>
                          <div className="absolute inset-0 bg-sky/20 border-2 border-deep shadow-pixel-sm p-5 flex flex-col items-center justify-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                            <span className="absolute top-2 left-2 text-[10px] font-bold text-deep/40">REVERSO</span>
                            <p className="font-sans text-sm text-deep leading-relaxed break-words overflow-y-auto custom-scrollbar">{card.back || '...'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* VISTA SOLO PARA LA IMPRESORA */}
                  <div className="show-on-print">
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'black', margin: 0 }}>
                        {title || 'Tarjetas de Estudio'}
                      </h2>
                      <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                        Instrucciones: Recorta por los bordes sólidos y dobla por la línea punteada.
                      </p>
                    </div>

                    {/* Solo imprime tarjetas que tengan AMBOS lados completos */}
                    {cards.filter(c => c.front.trim() && c.back.trim()).map((card) => (
                      <div key={`print-${card.id}`} className="print-card-box">
                        
                        {/* MITAD IZQUIERDA: Frente */}
                        <div className="print-card-half print-dashed-line">
                          <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'black', wordBreak: 'break-word' }}>
                            {card.front}
                          </p>
                        </div>
                        
                        {/* MITAD DERECHA: Reverso */}
                        <div className="print-card-half">
                          <p style={{ fontSize: '18px', color: 'black', wordBreak: 'break-word' }}>
                            {card.back}
                          </p>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              )}
            </div>
          </div>
        </PageContainer>
      </main>

      {/* Ocultamos el Footer en impresión */}
      <div className="hide-on-print">
        <Footer />
      </div>
    </div>
  )
}