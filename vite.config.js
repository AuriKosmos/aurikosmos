import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cambia 'auri-kosmos' por el nombre exacto de tu repositorio en GitHub
// si algún día lo renombras, para que las rutas de GitHub Pages sigan funcionando.
export default defineConfig({
  base: '/auri-kosmos/',
  plugins: [react()],
})
