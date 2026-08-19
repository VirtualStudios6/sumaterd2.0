import { Download, Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ConfirmDialog, ErrorState, Notice, Spinner } from '../../components/Ui'
import { adminChangeInterests } from '../../services/admin'
import type { ChangeInterestRecord, ChangeInterestStatus } from '../../types'
import { formatDate } from '../../utils/date'

const STATUS_LABELS: Record<ChangeInterestStatus, string> = {
  new: 'Nueva',
  contacted: 'Contactada',
  accepted: 'Integrada',
  closed: 'Cerrada',
}

export function ChangeInterestsAdminPage() {
  const [items, setItems] = useState<ChangeInterestRecord[]>([])
  const [term, setTerm] = useState('')
  const [status, setStatus] = useState<ChangeInterestStatus | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [deleting, setDeleting] = useState<ChangeInterestRecord | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      setItems((await adminChangeInterests('list')).interests || [])
    } catch {
      setError('No pudimos cargar las solicitudes de Cambio.')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void load()
  }, [])
  const visible = useMemo(() => {
    const value = term.toLowerCase()
    return items.filter(
      (item) =>
        (status === 'all' || item.status === status) &&
        `${item.fullName} ${item.email} ${item.province} ${item.reference}`
          .toLowerCase()
          .includes(value),
    )
  }, [items, status, term])

  const updateStatus = async (item: ChangeInterestRecord, next: ChangeInterestStatus) => {
    try {
      await adminChangeInterests('setStatus', { id: item.id, status: next })
      setMessage('Seguimiento actualizado.')
      await load()
    } catch {
      setError('No se pudo actualizar el seguimiento.')
    }
  }

  const exportCsv = () => {
    const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`
    const rows = [
      [
        'Referencia',
        'Nombre',
        'Correo',
        'Teléfono',
        'Provincia',
        'Municipio',
        'Participación',
        'Estado',
        'Fecha',
      ],
      ...visible.map((item) => [
        item.reference,
        item.fullName,
        item.email,
        item.phone,
        item.province,
        item.municipality,
        item.participation,
        STATUS_LABELS[item.status],
        formatDate(item.createdAt),
      ]),
    ]
    const url = URL.createObjectURL(
      new Blob([`\ufeff${rows.map((row) => row.map(escape).join(',')).join('\n')}`], {
        type: 'text/csv;charset=utf-8',
      }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = `sumaterd-cambio-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="admin-title">
        <div>
          <p>Participación</p>
          <h1>Solicitudes de Cambio</h1>
        </div>
        <button className="button secondary" onClick={exportCsv} disabled={!visible.length}>
          <Download /> Exportar CSV
        </button>
      </div>
      <div className="toolbar admin-change-toolbar">
        <div className="tabs">
          {(['all', 'new', 'contacted', 'accepted', 'closed'] as const).map((item) => (
            <button
              key={item}
              className={status === item ? 'active' : ''}
              onClick={() => setStatus(item)}
            >
              {item === 'all' ? 'Todas' : STATUS_LABELS[item]}
            </button>
          ))}
        </div>
        <label className="admin-search">
          <Search />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Buscar solicitud"
          />
        </label>
      </div>
      <div className="privacy-admin-note">
        Esta sección contiene datos personales y preferencias sensibles. Úsalos únicamente para el
        seguimiento autorizado.
      </div>
      {error && <ErrorState message={error} />}
      {message && <Notice>{message}</Notice>}
      {loading ? (
        <Spinner />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Persona</th>
                <th>Ubicación</th>
                <th>Participación</th>
                <th>Seguimiento</th>
                <th>Fecha</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.fullName}</strong>
                    <small>
                      {item.email} · {item.phone || 'Sin teléfono'}
                      <br />
                      {item.reference}
                    </small>
                  </td>
                  <td>
                    {item.province}
                    <small>{item.municipality}</small>
                  </td>
                  <td>{item.participation}</td>
                  <td>
                    <select
                      className="admin-status-select"
                      value={item.status}
                      onChange={(event) =>
                        void updateStatus(item, event.target.value as ChangeInterestStatus)
                      }
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option value={value} key={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{formatDate(item.createdAt)}</td>
                  <td>
                    <button
                      className="icon-button danger-link"
                      onClick={() => setDeleting(item)}
                      aria-label="Eliminar solicitud"
                    >
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length && <p className="table-empty">No hay solicitudes en esta vista.</p>}
        </div>
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="¿Eliminar esta solicitud?"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return
          adminChangeInterests('delete', { id: deleting.id })
            .then(async () => {
              setDeleting(null)
              setMessage('Solicitud eliminada.')
              await load()
            })
            .catch(() => setError('No se pudo eliminar la solicitud.'))
        }}
      >
        Los datos y su referencia se eliminarán definitivamente.
      </ConfirmDialog>
    </>
  )
}
