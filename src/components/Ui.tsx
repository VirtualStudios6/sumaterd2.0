import type { ReactNode } from 'react'
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
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  )
}
export function ErrorState({ message }: { message: string }) {
  return (
    <div className="notice error" role="alert">
      {message}
    </div>
  )
}
export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="notice" role="status">
      {children}
    </div>
  )
}
export function ConfirmDialog({
  open,
  title,
  children,
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  children: ReactNode
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!open) return null
  return (
    <div className="modal-backdrop">
      <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title">
        <h2 id="dialog-title">{title}</h2>
        <p>{children}</p>
        <div className="actions">
          <button className="button secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button className="button danger" onClick={onConfirm}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
