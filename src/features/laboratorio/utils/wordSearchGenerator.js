// Generador de sopa de letras — coloca cada palabra en una grilla
// en una de 8 direcciones (horizontal, vertical, diagonal, hacia adelante o atrás),
// y rellena el resto con letras aleatorias.

const ALL_DIRECTIONS = [
  [0, 1],   // derecha
  [0, -1],  // izquierda
  [1, 0],   // abajo
  [-1, 0],  // arriba
  [1, 1],   // diagonal abajo-derecha
  [1, -1],  // diagonal abajo-izquierda
  [-1, 1],  // diagonal arriba-derecha
  [-1, -1], // diagonal arriba-izquierda
]

// Conjuntos de direcciones por dificultad — para adaptar el reto a la edad.
export const DIFFICULTY_DIRECTIONS = {
  facil: [[0, 1], [1, 0]], // solo horizontal y vertical, siempre hacia adelante
  media: [[0, 1], [1, 0], [1, 1], [1, -1]], // + diagonales, siempre hacia adelante
  dificil: ALL_DIRECTIONS, // todas las direcciones, incluye al revés
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function normalize(word) {
  return word
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
    .replace(/[^A-ZÑ]/g, '') // solo letras
}

export function generateWordSearch(rawWords, options = {}) {
  const words = [...new Set(rawWords.map(normalize).filter(Boolean))]
  const directions = options.directions ?? ALL_DIRECTIONS

  if (words.length === 0) {
    return { grid: [], placed: [], unplaced: [], placements: [], size: 0 }
  }

  const longest = Math.max(...words.map((w) => w.length))
  const totalLetters = words.reduce((sum, w) => sum + w.length, 0)
  const autoSize = Math.min(26, Math.max(12, longest + 3, Math.ceil(Math.sqrt(totalLetters * 2.2))))
  // Si se pide un tamaño específico, se respeta — pero nunca más chico que la palabra más larga.
  const size = options.targetSize ? Math.max(options.targetSize, longest + 1) : autoSize

  const grid = Array.from({ length: size }, () => Array(size).fill(null))
  const placed = []
  const unplaced = []
  const placements = [] // { word, cells: [[r,c], ...] } — para pintar la hoja de respuestas

  const sorted = [...words].sort((a, b) => b.length - a.length)

  for (const word of sorted) {
    let placedOk = false

    for (let attempt = 0; attempt < 400 && !placedOk; attempt++) {
      const [dr, dc] = directions[Math.floor(Math.random() * directions.length)]
      const row = Math.floor(Math.random() * size)
      const col = Math.floor(Math.random() * size)
      const endRow = row + dr * (word.length - 1)
      const endCol = col + dc * (word.length - 1)

      if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue

      let fits = true
      for (let i = 0; i < word.length; i++) {
        const r = row + dr * i
        const c = col + dc * i
        const existing = grid[r][c]
        if (existing !== null && existing !== word[i]) {
          fits = false
          break
        }
      }
      if (!fits) continue

      const cells = []
      for (let i = 0; i < word.length; i++) {
        const r = row + dr * i
        const c = col + dc * i
        grid[r][c] = word[i]
        cells.push([r, c])
      }
      placed.push(word)
      placements.push({ word, cells })
      placedOk = true
    }

    if (!placedOk) unplaced.push(word)
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === null) {
        grid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
      }
    }
  }

  return { grid, placed, unplaced, placements, size }
}