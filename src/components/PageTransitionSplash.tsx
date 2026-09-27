export function PageTransitionSplash() {
  return (
    <div
      className="page-transition-splash"
      role="status"
      aria-live="polite"
      aria-label="Cargando página"
    >
      <span className="page-transition-bar" aria-hidden="true" />
      <div className="page-transition-content" aria-hidden="true">
        <img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" width="72" height="72" />
      </div>
      <p className="sr-only">Cargando contenido…</p>
    </div>
  )
}
