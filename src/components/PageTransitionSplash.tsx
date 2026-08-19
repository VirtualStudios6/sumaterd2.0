import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useLocation } from 'react-router-dom'

export function PageTransitionSplash() {
  const location = useLocation()
  const [phase, setPhase] = useState<'visible' | 'leaving' | 'hidden'>('visible')

  useEffect(() => {
    setPhase('visible')
    const reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const leaveTimer = window.setTimeout(() => setPhase('leaving'), reducedMotion ? 2800 : 2700)
    const hideTimer = window.setTimeout(() => setPhase('hidden'), 3000)
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
      <div className="page-transition-content" aria-hidden="true">
        <div className="page-transition-security">
          <ShieldCheck />
          <span>Conexión protegida</span>
        </div>
        <div className="page-transition-mark">
          <span>Súmate</span>
          <strong>RD</strong>
          <i />
        </div>
        <p>Cargando contenido de forma segura…</p>
      </div>
      <span className="sr-only">Conexión protegida. Cargando página.</span>
    </div>
  )
}
