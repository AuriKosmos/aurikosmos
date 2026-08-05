// Sugerencias simuladas para "Construye mi clase".
// IMPORTANTE: esto NO es IA real — son plantillas de texto con {tema}
// interpolado, filtradas por los recursos disponibles. Sirve para probar
// la interacción del constructor de bloques ya mismo, sin backend ni
// API key. Cuando exista Auri AI de verdad, se reemplaza únicamente la
// función getSuggestions() por una llamada a la API — el resto de esta
// pantalla no cambia.

export const BLOCK_TYPES = [
  { id: 'objetivo', label: 'Objetivo', emoji: '🎯' },
  { id: 'rompehielo', label: 'Rompehielos', emoji: '🎮' },
  { id: 'explicacion', label: 'Explicación', emoji: '📚' },
  { id: 'actividad', label: 'Actividad', emoji: '🧩' },
  { id: 'discusion', label: 'Discusión', emoji: '💬' },
  { id: 'evaluacion', label: 'Evaluación', emoji: '📝' },
]

export const RESOURCE_OPTIONS = [
  { id: 'proyector', label: 'Proyector' },
  { id: 'computadoras', label: 'Computadoras' },
  { id: 'tablets', label: 'Tablets' },
]

const TEMPLATES = {
  objetivo: [
    { text: 'Que las y los estudiantes comprendan {tema} y puedan explicarlo con sus propias palabras.', tech: [] },
    { text: 'Que reconozcan al menos tres ejemplos de {tema} en su vida cotidiana.', tech: [] },
    { text: 'Que apliquen lo aprendido sobre {tema} resolviendo un caso práctico en equipo.', tech: [] },
  ],
  rompehielo: [
    { text: "Lluvia de ideas rápida: '¿Qué saben ya sobre {tema}?' anotada en la pizarra.", tech: [] },
    { text: 'Un video corto de 2 minutos sobre {tema} para abrir la curiosidad.', tech: ['proyector'] },
    { text: 'Encuesta relámpago sobre lo que esperan aprender de {tema}.', tech: ['tablets'] },
  ],
  explicacion: [
    { text: 'Explicación guiada de {tema} apoyada con un esquema en la pizarra.', tech: [] },
    { text: 'Presentación con diapositivas de los conceptos clave de {tema}.', tech: ['proyector'] },
    { text: 'Exploración autónoma: cada grupo investiga un aspecto de {tema} y luego comparte.', tech: ['tablets'] },
  ],
  actividad: [
    { text: 'Trabajo en parejas: resolver una ficha práctica sobre {tema}.', tech: [] },
    { text: 'Juego de roles donde cada estudiante representa un elemento de {tema}.', tech: [] },
    { text: 'Estación de computadoras: simulación interactiva sobre {tema}.', tech: ['computadoras'] },
  ],
  discusion: [
    { text: 'Debate corto: dos posturas distintas frente a {tema}.', tech: [] },
    { text: "Ronda de preguntas abiertas: '¿Qué fue lo que más les sorprendió de {tema}?'", tech: [] },
    { text: 'Análisis en grupos pequeños de un caso sobre {tema}, luego puesta en común.', tech: [] },
  ],
  evaluacion: [
    { text: 'Ticket de salida: una pregunta escrita sobre {tema} antes de salir del aula.', tech: [] },
    { text: 'Mini quiz de 5 preguntas sobre {tema}.', tech: [] },
    { text: 'Quiz interactivo con resultados en vivo sobre {tema}.', tech: ['tablets'] },
  ],
}

/**
 * Devuelve sugerencias para un tipo de bloque, ya interpoladas con el
 * tema y filtradas por los recursos disponibles (la pizarra siempre
 * cuenta como disponible).
 */
export function getSuggestions(blockType, tema, availableResources) {
  const list = TEMPLATES[blockType] || []
  const topic = tema.trim() || 'el tema de tu clase'
  const available = new Set(['pizarra', ...availableResources])

  return list
    .filter((s) => s.tech.every((need) => available.has(need)))
    .map((s) => s.text.replace('{tema}', topic))
}