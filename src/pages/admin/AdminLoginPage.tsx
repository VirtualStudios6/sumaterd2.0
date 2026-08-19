import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Brand } from '../../components/Brand'
import { GoogleAuthButton } from '../../components/GoogleAuthButton'
import { ErrorState } from '../../components/Ui'
import { useAdmin } from '../../features/admin/AdminProvider'
export function AdminLoginPage() {
  const { authenticated, loading, login, loginWithGoogle } = useAdmin()
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
  const submitGoogle = async () => {
    setError('')
    try {
      if (await loginWithGoogle()) navigate('/admin')
    } catch (reason) {
      setError(
        reason instanceof Error && reason.message
          ? reason.message
          : 'No pudimos verificar esta cuenta de Google.',
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
          <GoogleAuthButton
            loading={loading}
            onClick={submitGoogle}
            label="Entrar al panel con Google"
          />
          <div className="auth-divider">
            <span>o usa tu contraseña</span>
          </div>
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
