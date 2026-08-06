import { Navbar, Footer, PageContainer } from '../../../components/layout'

const MACHINES = [
  { id: 'sopa-de-letras', label: 'Sopa de letras', emoji: '🔤', active: true },
  { id: 'crucigramas', label: 'Crucigramas', emoji: '🧩', active: true },
  { id: 'flashcards', label: 'Flashcards', emoji: '🃏', active: true }, // <-- ¡MÁQUINA ENCENDIDA!
  { id: 'bingo', label: 'Bingo', emoji: '🎱', active: true },
  { id: 'diplomas', label: 'Diplomas', emoji: '🎓', active: false },
  { id: 'certificados', label: 'Certificados', emoji: '📜', active: false },
  { id: 'horarios', label: 'Horarios', emoji: '🗓️', active: false },
  { id: 'rubricas', label: 'Rúbricas', emoji: '📊', active: false },
  { id: 'planificaciones', label: 'Planificaciones', emoji: '🗂️', active: false },
  { id: 'calendarios', label: 'Calendarios', emoji: '📅', active: false },
  { id: 'ruleta', label: 'Ruleta', emoji: '🎡', active: false },
  { id: 'dados', label: 'Dados', emoji: '🎲', active: true }, // <-- ¡MÁQUINA ENCENDIDA!
]

function MachineCard({ machine }) {
  if (machine.active) {
    return (
      <a
        href={`#/laboratorio/${machine.id}`}
        className="group relative bg-white border-2 border-deep p-5 shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-pixel-sm transition-all flex flex-col items-center text-center focus:outline-none focus-visible:ring-4 focus-visible:ring-sky/50"
      >
        {/* Lucita verde parpadeante de "máquina encendida" */}
        <span className="absolute top-3 right-3 w-2 h-2 bg-mint animate-pulse" aria-hidden="true" />
        
        <span className="text-4xl mb-3">{machine.emoji}</span>
        <h3 className="font-display font-semibold text-deep mb-2">{machine.label}</h3>
        <span className="font-label text-[9px] tracking-wide bg-mint/30 border border-deep px-2 py-1 text-deep">
          DISPONIBLE
        </span>
      </a>
    )
  }

  return (
    <div className="bg-white/60 border-2 border-dashed border-deep/20 p-5 flex flex-col items-center text-center opacity-60 cursor-not-allowed">
      <span className="text-4xl mb-3 grayscale">{machine.emoji}</span>
      <h3 className="font-display font-semibold text-deep/60 mb-2">{machine.label}</h3>
      <span className="font-label text-[9px] tracking-wide bg-deep/10 border border-deep/30 px-2 py-1 text-deep/50">
        🔒 PRÓXIMAMENTE
      </span>
    </div>
  )
}

export default function Laboratorio() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar backHref="#/" backLabel="INICIO" />

      <section className="pt-6 pb-16 text-center">
        <PageContainer>
          <p className="font-label text-[10px] tracking-widest text-brand mb-5">🧩 PLANETA 2</p>
          <h1 className="font-display text-4xl sm:text-5xl text-deep font-semibold mb-4">
            Laboratorio
          </h1>
          <p className="text-deep/70 max-w-lg mx-auto">
            Aquí no hay botones. Hay máquinas. Cada una genera algo distinto para tu próxima clase —
            ya tenemos varias encendidas. Las demás llegarán en las próximas fases.
          </p>
        </PageContainer>
      </section>

      <section className="pb-24">
        <PageContainer>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {MACHINES.map((m) => (
              <MachineCard key={m.id} machine={m} />
            ))}
          </div>
        </PageContainer>
      </section>

      <Footer />
    </div>
  )
}