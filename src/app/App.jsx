import { useState } from 'react'
import Home from '../features/home/pages/Home.jsx'
import Laboratorio from '../features/laboratorio/pages/Laboratorio.jsx'
import SopaDeLetras from '../features/laboratorio/pages/SopaDeLetras.jsx'
import Crucigramas from '../features/laboratorio/pages/Crucigramas.jsx'
import Flashcards from '../features/laboratorio/pages/Flashcards'
import Dados from '../features/laboratorio/pages/Dados.jsx'
import Observatorio from '../features/observatorio/pages/Observatorio.jsx'
import ConstruyeMiClase from '../features/observatorio/pages/ConstruyeMiClase.jsx'
import DesignSystem from '../features/design-system/pages/DesignSystem.jsx'
import { AuriIntro, AURI_INTRO_SESSION_KEY } from '../components/auri'
import { useHashRoute } from './useHashRoute.js'

export default function App() {
  const route = useHashRoute()

  const isHome = route === '#/' || route === '' || route === '#'
  const [introDone, setIntroDone] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.sessionStorage.getItem(AURI_INTRO_SESSION_KEY) === '1'
  })

  const handleEnter = () => {
    window.sessionStorage.setItem(AURI_INTRO_SESSION_KEY, '1')
    setIntroDone(true)
  }

  if (isHome && !introDone) return <AuriIntro onEnter={handleEnter} />

  if (route.startsWith('#/laboratorio/sopa-de-letras')) return <SopaDeLetras />
  if (route.startsWith('#/laboratorio/crucigramas')) return <Crucigramas />
  if (route.startsWith('#/laboratorio/flashcards')) return <Flashcards />
  if (route.startsWith('#/laboratorio/bingo')) return <Bingo />
  if (route.startsWith('#/laboratorio/dados')) return <Dados />
  if (route.startsWith('#/laboratorio')) return <Laboratorio />
  if (route.startsWith('#/observatorio/construye-mi-clase')) return <ConstruyeMiClase />
  if (route.startsWith('#/observatorio')) return <Observatorio />
  if (route.startsWith('#/design-system')) return <DesignSystem />
  return <Home />
}