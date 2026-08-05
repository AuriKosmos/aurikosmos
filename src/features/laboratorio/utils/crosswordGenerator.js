// Generador de crucigramas — coloca palabras cruzándolas entre sí
// (algoritmo greedy: cada palabra nueva busca una letra en común con
// las ya colocadas y se cruza ahí, en la dirección perpendicular).

export function normalizeWord(word) {
  return word
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-ZÑ]/g, '')
}

// Convierte el texto del textarea ("PALABRA - pista" por línea) en entradas {word, clue}.
export function parseCrosswordInput(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([^-:]+)[-:]\s*(.*)$/)
      const word = normalizeWord(match ? match[1] : line)
      const clue = match ? match[2].trim() : ''
      return { word, clue }
    })
    .filter((e) => e.word.length >= 2)
}

function key(r, c) {
  return `${r},${c}`
}

export function generateCrossword(entries) {
  // Quita duplicados por palabra, conservando la primera pista.
  const seen = new Set()
  const unique = []
  for (const e of entries) {
    if (!seen.has(e.word)) {
      seen.add(e.word)
      unique.push(e)
    }
  }

  if (unique.length === 0) {
    return { cells: [], rows: 0, cols: 0, across: [], down: [], unplaced: [] }
  }

  const sorted = [...unique].sort((a, b) => b.word.length - a.word.length)

  const grid = new Map() // "r,c" -> letra
  const placements = [] // {word, clue, row, col, dir}

  function canPlace(word, row, col, dir) {
    for (let i = 0; i < word.length; i++) {
      const r = dir === 'H' ? row : row + i
      const c = dir === 'H' ? col + i : col
      const existing = grid.get(key(r, c))
      if (existing !== undefined && existing !== word[i]) return false
      if (existing === undefined) {
        if (dir === 'H') {
          if (grid.has(key(r - 1, c)) || grid.has(key(r + 1, c))) return false
        } else {
          if (grid.has(key(r, c - 1)) || grid.has(key(r, c + 1))) return false
        }
      }
    }
    if (dir === 'H') {
      if (grid.has(key(row, col - 1)) || grid.has(key(row, col + word.length))) return false
    } else {
      if (grid.has(key(row - 1, col)) || grid.has(key(row + word.length, col))) return false
    }
    return true
  }

  function place(entry, row, col, dir) {
    for (let i = 0; i < entry.word.length; i++) {
      const r = dir === 'H' ? row : row + i
      const c = dir === 'H' ? col + i : col
      grid.set(key(r, c), entry.word[i])
    }
    placements.push({ ...entry, row, col, dir })
  }

  // Primera palabra: horizontal, en el origen.
  place(sorted[0], 0, 0, 'H')

  const unplaced = []

  for (const entry of sorted.slice(1)) {
    const candidates = []
    for (let i = 0; i < entry.word.length; i++) {
      const letter = entry.word[i]
      for (const [k, val] of grid.entries()) {
        if (val !== letter) continue
        const [r, c] = k.split(',').map(Number)
        const candH = { row: r, col: c - i, dir: 'H' }
        if (canPlace(entry.word, candH.row, candH.col, 'H')) candidates.push(candH)
        const candV = { row: r - i, col: c, dir: 'V' }
        if (canPlace(entry.word, candV.row, candV.col, 'V')) candidates.push(candV)
      }
    }

    if (candidates.length > 0) {
      const pick = candidates[Math.floor(Math.random() * candidates.length)]
      place(entry, pick.row, pick.col, pick.dir)
    } else {
      unplaced.push(entry.word)
    }
  }

  // Bounding box y normalización de coordenadas.
  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity
  for (const k of grid.keys()) {
    const [r, c] = k.split(',').map(Number)
    minR = Math.min(minR, r)
    maxR = Math.max(maxR, r)
    minC = Math.min(minC, c)
    maxC = Math.max(maxC, c)
  }

  const rows = maxR - minR + 1
  const cols = maxC - minC + 1
  const cells = Array.from({ length: rows }, () => Array(cols).fill(null))
  for (const [k, letter] of grid.entries()) {
    const [r, c] = k.split(',').map(Number)
    cells[r - minR][c - minC] = letter
  }

  const normalizedPlacements = placements.map((p) => ({
    ...p,
    row: p.row - minR,
    col: p.col - minC,
  }))

  // Numeración estilo crucigrama estándar.
  const numbers = new Map()
  let counter = 1
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cells[r][c] === null) continue
      const startsAcross = (c === 0 || cells[r][c - 1] === null) && c + 1 < cols && cells[r][c + 1] !== null
      const startsDown = (r === 0 || cells[r - 1][c] === null) && r + 1 < rows && cells[r + 1][c] !== null
      if (startsAcross || startsDown) {
        numbers.set(key(r, c), counter)
        counter++
      }
    }
  }

  const across = normalizedPlacements
    .filter((p) => p.dir === 'H')
    .map((p) => ({ ...p, number: numbers.get(key(p.row, p.col)) }))
    .sort((a, b) => a.number - b.number)

  const down = normalizedPlacements
    .filter((p) => p.dir === 'V')
    .map((p) => ({ ...p, number: numbers.get(key(p.row, p.col)) }))
    .sort((a, b) => a.number - b.number)

  return { cells, rows, cols, numbers, across, down, unplaced }
}