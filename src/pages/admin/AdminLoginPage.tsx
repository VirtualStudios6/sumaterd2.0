import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ErrorState } from '../../components/Ui'
import { Brand } from '../../components/Brand'
import { useAdmin } from '../../features/admin/AdminProvider'
export function AdminLoginPage() {
  const { authenticated, loading, login } = useAdmin()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  if (authenticated) return <Navigate to="/admin" replace />
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/admin')
    } catch (reason) {
      setError(
        reason instanceof Error && reason.message.includes('permisos')
          ? reason.message
          : 'Correo, contraseña o permisos administrativos incorrectos.',
      )
    }
  }
  return (
    <div className="admin-login">
      <div>
        <Brand />
        <p className="eyebrow">Administración</p>
        <h1>Acceso al CMS</h1>
        <p>Acceso protegido con Firebase Authentication y permisos administrativos.</p>
        <form className="form" onSubmit={submit}>
          {error && <ErrorState message={error} />}
          <label>
            Correo administrativo
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <button className="button full" disabled={loading}>
            {loading ? 'Verificando…' : 'Entrar al panel'}
          </button>
        </form>
      </div>
    </div>
  )
}
