import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export function PageTransitionSplash() {
  const location = useLocation()
  const [phase, setPhase] = useState<'visible' | 'leaving' | 'hidden'>('visible')

  useEffect(() => {
    setPhase('visible')
    const reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const leaveTimer = window.setTimeout(() => setPhase('leaving'), reducedMotion ? 80 : 360)
    const hideTimer = window.setTimeout(() => setPhase('hidden'), reducedMotion ? 120 : 570)
    return () => {
      window.clearTimeout(leaveTimer)
      window.clearTimeout(hideTimer)
    }
  }, [location.pathname])

  if (phase === 'hidden') return null
  return (
    <div
      className={`page-transition-splash ${phase === 'leaving' ? 'is-leaving' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Cargando página"
    >
      <div className="page-transition-mark" aria-hidden="true">
        <span>Súmate</span>
        <strong>RD</strong>
        <i />
      </div>
      <span className="sr-only">Cargando página</span>
    </div>
  )
}
