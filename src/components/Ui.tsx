import { AlertTriangle, Inbox, Info } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
export function Spinner({ label = 'Cargando' }: { label?: string }) {
  return (
    <div className="status" role="status">
      <span className="spinner" />
      {label}…
    </div>
  )
}
export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="empty">
      <Inbox aria-hidden="true" />
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  )
}
export function ErrorState({ message }: { message: string }) {
  return (
    <div className="notice error" role="alert">
      <AlertTriangle aria-hidden="true" />
      {message}
    </div>
  )
}
export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="notice" role="status">
      <Info aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}
export function ConfirmDialog({
  open,
  title,
  children,
  onCancel,
  onConfirm,
  busy = false,
}: {
  open: boolean
  title: string
  children: ReactNode
  onCancel: () => void
  onConfirm: () => void
  busy?: boolean
}) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, busy, onCancel])
  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={() => !busy && onCancel()}>
      <div
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="dialog-title">{title}</h2>
        <p>{children}</p>
        <div className="actions">
          <button ref={cancelRef} className="button secondary" onClick={onCancel} disabled={busy}>
            Cancelar
          </button>
          <button className="button danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
