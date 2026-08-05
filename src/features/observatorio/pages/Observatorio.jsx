import { Navbar, Footer, PageContainer } from '../../../components/layout'

const IDEAS = [
  {
    id: 'construye-mi-clase',
    emoji: '🌌',
    label: 'Construye mi clase',
    desc: 'Un lienzo de bloques — objetivo, actividad, evaluación — que arrastras y editas.',
    active: true,
  },
  {
    id: 'conversacion',
    emoji: '✨',
    label: 'Modo conversación',
    desc: 'Auri hace preguntas cortas, como un diseñador instruccional, hasta armar tu clase.',
    active: false,
  },
  {
    id: 'constructor-inteligente',
    emoji: '🧩',
    label: 'Constructor inteligente',
    desc: 'Escribes un tema y aparecen botones: crucigrama, flashcards, bingo, quiz...',
    active: false,
  },
  {
    id: 'ia-visual',
    emoji: '🖼️',
    label: 'IA visual',
    desc: 'Subes una foto de una hoja y Auri la moderniza, traduce o adapta.',
    active: false,
  },
  {
    id: 'adaptador',
    emoji: '🌎',
    label: 'Adaptador NEE',
    desc: 'Un botón que adapta tamaño, contraste y actividades para necesidades específicas.',
    active: false,
  },
  {
    id: 'pregunta-auri',
    emoji: '🐧',
    label: 'Pregúntale a Auri',
    desc: 'No un chat largo — una conversación corta, siempre con opciones para elegir.',
    active: false,
  },
  {
    id: 'inspiracion',
    emoji: '⭐',
    label: 'Inspiración',
    desc: 'Auri trae cinco ideas relacionadas con tu materia, sin que pidas nada.',
    active: false,
  },
  {
    id: 'estilo',
    emoji: '🤖',
    label: 'IA que conoce tu estilo',
    desc: 'Aprende cómo das clase y genera siguiendo tu forma de enseñar.',
    active: false,
  },
  {
    id: 'mapa-aprendizaje',
    emoji: '🗺️',
    label: 'El mapa del aprendizaje',
    desc: 'Los recursos organizados como un mapa de constelaciones, no como carpetas.',
    active: false,
  },
]

function IdeaCard({ idea }) {
  if (idea.active) {
    return (
      <a
        href={`#/observatorio/${idea.id}`}
        className="group relative bg-deep border-2 border-sun p-5 shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-pixel-sm transition-all flex flex-col items-center text-center"
      >
        <span className="absolute top-3 right-3 w-2 h-2 bg-sun animate-pulse" aria-hidden="true" />
        <span className="text-4xl mb-3">{idea.emoji}</span>
        <h3 className="font-display font-semibold text-white mb-2">{idea.label}</h3>
        <p className="text-xs text-white/60 mb-3 leading-relaxed">{idea.desc}</p>
        <span className="font-label text-[9px] tracking-wide bg-sun/20 border border-sun px-2 py-1 text-sun">
          PROTOTIPO
        </span>
      </a>
    )
  }

  return (
    <div className="bg-deep/40 border-2 border-dashed border-white/10 p-5 flex flex-col items-center text-center opacity-70">
      <span className="text-4xl mb-3 grayscale">{idea.emoji}</span>
      <h3 className="font-display font-semibold text-white/70 mb-2">{idea.label}</h3>
      <p className="text-xs text-white/40 mb-3 leading-relaxed">{idea.desc}</p>
      <span className="font-label text-[9px] tracking-wide bg-white/5 border border-white/20 px-2 py-1 text-white/40">
        🔒 PRÓXIMAMENTE
      </span>
    </div>
  )
}

export default function Observatorio() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar backHref="#/" backLabel="INICIO" />

      {/* Hero nocturno — contraste con el Laboratorio, que se siente "de día" */}
      <section className="bg-deep relative overflow-hidden">
        <span className="absolute top-8 left-10 text-sun text-xl" aria-hidden="true">✦</span>
        <span className="absolute bottom-10 right-16 text-sky text-lg" aria-hidden="true">✦</span>
        <span className="absolute top-16 right-1/3 text-blossom text-sm" aria-hidden="true">✦</span>
        <PageContainer className="pt-10 pb-16 text-center relative">
          <p className="font-label text-[10px] tracking-widest text-sky mb-5">🌙 PLANETA 4</p>
          <h1 className="font-display text-4xl sm:text-5xl text-white font-semibold mb-4">
            Observatorio
          </h1>
          <p className="text-white/60 max-w-lg mx-auto">
            Aquí viviría Auri AI. No un chatbot — un copiloto para docentes. La mayoría de estas
            ideas todavía son visión de una fase futura; una ya la puedes probar hoy.
          </p>
        </PageContainer>
      </section>

      <section className="py-16">
        <PageContainer>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {IDEAS.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </PageContainer>
      </section>

      <Footer />
    </div>
  )
}