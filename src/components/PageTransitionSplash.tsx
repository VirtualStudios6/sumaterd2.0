import { ShieldCheck } from 'lucide-react'

export function PageTransitionSplash() {
  return (
    <div
      className="page-transition-splash"
      role="status"
      aria-live="polite"
      aria-label="Cargando página"
    >
      <div className="page-transition-content" aria-hidden="true">
        <div className="page-transition-security">
          <ShieldCheck />
          <span>SumateRD</span>
        </div>
        <div className="page-transition-mark">
          <span>Súmate</span>
          <strong>RD</strong>
          <i />
        </div>
        <p>Cargando contenido…</p>
      </div>
      <span className="sr-only">Cargando página.</span>
    </div>
  )
}
