// Generador de cartones de bingo — a partir de una lista de elementos
// (palabras, números, lo que sea), arma varios cartones distintos: cada
// uno toma una selección al azar de esos elementos y los acomoda en una
// grilla, para que dos estudiantes casi nunca tengan el mismo cartón.

function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * generateBingoCards(items, options)
 * - items: array de strings, uno por elemento posible (palabra, número...)
 * - options.size: lado de la grilla (3, 4 o 5) — por defecto 5
 * - options.numCards: cuántos cartones distintos generar — por defecto 1
 * - options.freeCenter: si es true Y la grilla es de lado impar (3 o 5),
 *   el centro queda como casillero "GRATIS" ya marcado
 *
 * Cada cartón se arma barajando los elementos y tomando los primeros N
 * que hacen falta — por eso hacen falta al menos tantos elementos como
 * casilleros tiene un cartón. Si no alcanzan, ok queda en false y la
 * pantalla puede avisarle al docente cuántos elementos le faltan.
 */
export function generateBingoCards(items, options = {}) {
  const size = options.size ?? 5
  const numCards = Math.max(1, options.numCards ?? 1)
  const freeCenter = Boolean(options.freeCenter) && size % 2 === 1
  const center = Math.floor(size / 2)
  const cellsNeeded = size * size - (freeCenter ? 1 : 0)

  const clean = [...new Set(items.map((i) => i.trim()).filter(Boolean))]

  if (clean.length < cellsNeeded) {
    return { cards: [], size, cellsNeeded, available: clean.length, ok: false }
  }

  const cards = Array.from({ length: numCards }, () => {
    const picked = shuffle(clean).slice(0, cellsNeeded)
    const grid = []
    let idx = 0
    for (let r = 0; r < size; r++) {
      const row = []
      for (let c = 0; c < size; c++) {
        if (freeCenter && r === center && c === center) {
          row.push({ text: 'GRATIS', free: true })
        } else {
          row.push({ text: picked[idx], free: false })
          idx++
        }
      }
      grid.push(row)
    }
    return { grid }
  })

  return { cards, size, cellsNeeded, available: clean.length, ok: true }
}

/**
 * Orden de "cantado" para el docente: mezcla todos los elementos que
 * podrían salir en algún cartón, sin repetir, listos para leer uno por
 * uno en voz alta durante el juego.
 */
export function generateCallOrder(items) {
  return shuffle([...new Set(items.map((i) => i.trim()).filter(Boolean))])
}