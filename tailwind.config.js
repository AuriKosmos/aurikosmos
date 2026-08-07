/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Tokens de marca — Auri Kosmos Brand Book v1.0 (actualizado a estilo pixel art)
        deep: '#1B1E3A',   // azul marino oscuro — texto principal, contornos pixel
        brand: '#7C5CFC',  // morado — acentos, CTA
        sky: '#A9D6FF',    // celeste — fondos suaves (NO usar para texto)
        mint: '#8BCF9B',   // verde suave — highlights positivos
        sun: '#FFD166',    // amarillo — estrellas, detalles
        blossom: '#FFB3C6',// rosa — acentos suaves
        cream: '#FBF3EF',  // crema — fondo cálido alternativo
        // Extraídos por pixel de los PNG reales de Auri (no inventados):
        ember: '#F86611',  // naranja del pico y las patas
        nova: '#9A6AE7',   // morado vívido de la insignia del traje
      },
      fontFamily: {
        display: ['"Pixelify Sans"', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'monospace'],
        body: ['"Inter"', 'sans-serif'],
        // Antes: 'Press Start 2P'. Sus tildes son glifos añadidos después del
        // set original de 1986 y se dibujan más finos/chicos que el resto —
        // por eso la É de "CONOCÉ" se veía pequeña. Pixelify Sans mantiene el
        // aire pixel/retro pero con acentos dibujados con el mismo peso.
        label: ['"Pixelify Sans"', 'sans-serif'],
      },
      boxShadow: {
        pixel: '4px 4px 0 0 #1B1E3A',
        'pixel-sm': '3px 3px 0 0 #1B1E3A',
        'pixel-brand': '4px 4px 0 0 #7C5CFC',
      },
      backgroundImage: {
        'kosmos-glow':
          'radial-gradient(circle at 20% 20%, rgba(124,92,252,0.14), transparent 45%), radial-gradient(circle at 85% 10%, rgba(169,214,255,0.4), transparent 40%)',
      },
    },
  },
  plugins: [],
}