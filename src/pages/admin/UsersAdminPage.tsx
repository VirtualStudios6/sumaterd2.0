import { Search, ShieldBan, ShieldCheck, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ConfirmDialog, ErrorState, Notice, Spinner } from '../../components/Ui'
import { adminUsers } from '../../services/admin'
import type { AdminUserRecord } from '../../types'
import { formatDate } from '../../utils/date'

export function UsersAdminPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([])
  const [term, setTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [deleting, setDeleting] = useState<AdminUserRecord | null>(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setUsers((await adminUsers('list')).users || [])
    } catch {
      setError('No pudimos cargar los usuarios.')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void load()
  }, [])
  const visible = useMemo(() => {
    const value = term.toLowerCase()
    return users.filter((user) => `${user.fullName} ${user.email}`.toLowerCase().includes(value))
  }, [term, users])

  const toggleStatus = async (user: AdminUserRecord) => {
    setWorking(user.uid)
    setError('')
    setMessage('')
    try {
      await adminUsers('setStatus', {
        uid: user.uid,
        status: user.disabled || user.status === 'disabled' ? 'active' : 'disabled',
      })
      setMessage('Estado de la cuenta actualizado.')
      await load()
    } catch {
      setError('No se pudo cambiar el estado de esta cuenta.')
    } finally {
      setWorking('')
    }
  }

  return (
    <>
      <div className="admin-title">
        <div>
          <p>Comunidad</p>
          <h1>Usuarios</h1>
        </div>
        <span className="admin-total">{users.length} cuentas</span>
      </div>
      <div className="toolbar">
        <label className="admin-search">
          <Search />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Buscar por nombre o correo"
          />
        </label>
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
                <th>Usuario</th>
                <th>Cédula protegida</th>
                <th>Registro</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((user) => {
                const disabled = user.disabled || user.status === 'disabled'
                return (
                  <tr key={user.uid}>
                    <td>
                      <strong>{user.fullName}</strong>
                      <small>{user.email}</small>
                    </td>
                    <td>{user.cedulaMasked}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <span className={`status-pill ${disabled ? 'draft' : 'published'}`}>
                        {disabled ? 'Suspendido' : 'Activo'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          disabled={working === user.uid}
                          onClick={() => void toggleStatus(user)}
                          aria-label={disabled ? 'Reactivar cuenta' : 'Suspender cuenta'}
                          title={disabled ? 'Reactivar' : 'Suspender'}
                        >
                          {disabled ? <ShieldCheck /> : <ShieldBan />}
                        </button>
                        <button
                          onClick={() => setDeleting(user)}
                          aria-label="Eliminar cuenta"
                          title="Eliminar"
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!visible.length && <p className="table-empty">No hay usuarios en esta vista.</p>}
        </div>
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="¿Eliminar esta cuenta definitivamente?"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return
          setWorking(deleting.uid)
          adminUsers('delete', { uid: deleting.uid })
            .then(async () => {
              setDeleting(null)
              setMessage('Cuenta eliminada de Authentication y Firestore.')
              await load()
            })
            .catch(() => setError('No se pudo eliminar la cuenta.'))
            .finally(() => setWorking(''))
        }}
      >
        Se eliminarán el acceso, perfil y reserva de identidad. Esta acción no se puede deshacer.
      </ConfirmDialog>
    </>
  )
}
