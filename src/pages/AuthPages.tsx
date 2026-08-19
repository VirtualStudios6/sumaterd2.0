import { Eye, EyeOff } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../app/AuthProvider'
import { ErrorState, Notice, Spinner } from '../components/Ui'
import {
  changePassword,
  deleteAccountSecurely,
  getProfile,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  signInWithGoogle,
  updateProfileName,
} from '../services/auth'
import type { UserProfile } from '../types'
import { formatCedula, isValidCedula } from '../utils/cedula'
import { formatDate } from '../utils/date'

function PasswordField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const [shown, setShown] = useState(false)
  return (
    <label>
      {label}
      <span className="password-field">
        <input
          id={id}
          type={shown ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={id.includes('new') ? 'new-password' : 'current-password'}
          required
          minLength={8}
        />
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-label={shown ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {shown ? <EyeOff /> : <Eye />}
        </button>
      </span>
    </label>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285f4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.55h3.24c1.9-1.75 2.98-4.32 2.98-7.42Z"
      />
      <path
        fill="#34a853"
        d="M12 22c2.7 0 4.98-.9 6.63-2.35l-3.24-2.55c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.77-5.61-4.14H3.04v2.63A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#fbbc05"
        d="M6.39 13.92A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.92V7.45H3.04A10 10 0 0 0 2 12c0 1.64.39 3.19 1.04 4.55l3.35-2.63Z"
      />
      <path
        fill="#ea4335"
        d="M12 5.94c1.47 0 2.79.51 3.82 1.5l2.88-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.63C7.18 7.71 9.39 5.94 12 5.94Z"
      />
    </svg>
  )
}

function GoogleButton({ loading, onClick }: { loading: boolean; onClick: () => Promise<void> }) {
  return (
    <button
      className="google-auth-button"
      type="button"
      disabled={loading}
      onClick={() => void onClick()}
    >
      <GoogleIcon />
      {loading ? 'Conectando con Google…' : 'Continuar con Google'}
    </button>
  )
}

export function LoginPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cedula, setCedula] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  if (user) return <Navigate to="/perfil" replace />
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isValidCedula(cedula)) {
      setError('Los datos introducidos no son correctos.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await loginUser(email, password, cedula)
      navigate('/perfil')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Los datos introducidos no son correctos.')
    } finally {
      setLoading(false)
    }
  }
  const submitGoogle = async () => {
    setLoading(true)
    setError('')
    try {
      const credential = await signInWithGoogle()
      if (credential) navigate('/perfil')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos iniciar sesión con Google.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthShell title="Iniciar sesión" intro="Accede a tu cuenta de lector.">
      <Helmet>
        <title>Iniciar sesión — SumateRD</title>
      </Helmet>
      <form className="form" onSubmit={submit}>
        {error && <ErrorState message={error} />}
        <GoogleButton loading={loading} onClick={submitGoogle} />
        <div className="auth-divider">
          <span>o usa tu correo</span>
        </div>
        <label>
          Cédula
          <input
            value={cedula}
            onChange={(e) => setCedula(formatCedula(e.target.value))}
            inputMode="numeric"
            autoComplete="off"
            placeholder="000-0000000-0"
            required
          />
        </label>
        <label>
          Correo electrónico
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <PasswordField id="password" label="Contraseña" value={password} onChange={setPassword} />
        <div className="form-row">
          <Link to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
        </div>
        <button className="button full" disabled={loading}>
          {loading ? 'Comprobando…' : 'Iniciar sesión'}
        </button>
        <p className="form-foot">
          ¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
        </p>
      </form>
    </AuthShell>
  )
}

export function RegisterPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState({
    fullName: '',
    cedula: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  if (user) return <Navigate to="/perfil" replace />
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isValidCedula(data.cedula)) return setError('La cédula no es válida.')
    if (data.password !== data.confirm) return setError('Las contraseñas no coinciden.')
    if (!accepted) return setError('Debes aceptar los términos y la privacidad.')
    setLoading(true)
    setError('')
    try {
      await registerUser(data)
      navigate('/perfil')
    } catch {
      setError('No pudimos completar el registro. Revisa los datos o intenta más tarde.')
    } finally {
      setLoading(false)
    }
  }
  const submitGoogle = async () => {
    setLoading(true)
    setError('')
    try {
      const credential = await signInWithGoogle()
      if (credential) navigate('/perfil')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos continuar con Google.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthShell title="Crear cuenta" intro="Regístrate para gestionar tu perfil en SumateRD.">
      <Helmet>
        <title>Crear cuenta — SumateRD</title>
      </Helmet>
      <form className="form" onSubmit={submit}>
        {error && <ErrorState message={error} />}
        <GoogleButton loading={loading} onClick={submitGoogle} />
        <p className="google-auth-notice">
          Al continuar con Google aceptas los términos y la política de privacidad.
        </p>
        <div className="auth-divider">
          <span>o crea tu cuenta con correo</span>
        </div>
        <label>
          Nombre completo
          <input
            value={data.fullName}
            onChange={(e) => setData({ ...data, fullName: e.target.value })}
            autoComplete="name"
            minLength={3}
            required
          />
        </label>
        <label>
          Cédula dominicana
          <input
            value={data.cedula}
            onChange={(e) => setData({ ...data, cedula: formatCedula(e.target.value) })}
            inputMode="numeric"
            placeholder="000-0000000-0"
            required
          />
        </label>
        <label>
          Correo electrónico
          <input
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            autoComplete="email"
            required
          />
        </label>
        <PasswordField
          id="new-password"
          label="Contraseña"
          value={data.password}
          onChange={(password) => setData({ ...data, password })}
        />
        <PasswordField
          id="confirm-password"
          label="Confirmar contraseña"
          value={data.confirm}
          onChange={(confirm) => setData({ ...data, confirm })}
        />
        <label className="check">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />{' '}
          Acepto los términos y la política de privacidad.
        </label>
        <button className="button full" disabled={loading}>
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
        <p className="form-foot">
          ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </form>
    </AuthShell>
  )
}

export function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await resetPassword(email)
      setSent(true)
    } catch {
      setError('No pudimos procesar la solicitud. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthShell
      title="Recuperar contraseña"
      intro="Te enviaremos las instrucciones si el correo corresponde a una cuenta."
    >
      <form className="form" onSubmit={submit}>
        {sent && <Notice>Solicitud procesada. Revisa tu correo y la carpeta de spam.</Notice>}
        {error && <ErrorState message={error} />}
        <label>
          Correo electrónico
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <button className="button full" disabled={loading}>
          {loading ? 'Enviando…' : 'Enviar instrucciones'}
        </button>
      </form>
    </AuthShell>
  )
}

export function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [name, setName] = useState('')
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const hasPassword = user?.providerData.some((provider) => provider.providerId === 'password')
  useEffect(() => {
    if (user)
      getProfile(user.uid)
        .then((p) => {
          setProfile(p)
          setName(p?.fullName || '')
        })
        .catch(() => setError('No pudimos cargar el perfil.'))
  }, [user])
  if (authLoading)
    return (
      <div className="container page">
        <Spinner />
      </div>
    )
  if (!user) return <Navigate to="/login" replace />
  const saveName = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await updateProfileName(user.uid, name)
      setMessage('Nombre actualizado.')
    } catch {
      setError('No pudimos actualizar el nombre.')
    }
  }
  const savePassword = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await changePassword(current, next)
      setCurrent('')
      setNext('')
      setMessage('Contraseña actualizada.')
    } catch {
      setError('No pudimos cambiar la contraseña. Verifica tu contraseña actual.')
    }
  }
  return (
    <div className="container page profile-page">
      <Helmet>
        <title>Mi perfil — SumateRD</title>
      </Helmet>
      <header className="page-title">
        <p>Cuenta</p>
        <h1>Mi perfil</h1>
      </header>
      {error && <ErrorState message={error} />}
      {message && <Notice>{message}</Notice>}
      <div className="profile-grid">
        <section>
          <h2>Información</h2>
          {profile ? (
            <dl>
              <div>
                <dt>Nombre</dt>
                <dd>{profile.fullName}</dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>{profile.email}</dd>
              </div>
              <div>
                <dt>Cédula</dt>
                <dd>{profile.cedulaMasked}</dd>
              </div>
              <div>
                <dt>Miembro desde</dt>
                <dd>{formatDate(profile.createdAt)}</dd>
              </div>
            </dl>
          ) : (
            <Spinner />
          )}
        </section>
        <section>
          <h2>Actualizar nombre</h2>
          <form className="form" onSubmit={saveName}>
            <label>
              Nombre completo
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={3}
              />
            </label>
            <button className="button">Guardar cambios</button>
          </form>
        </section>
        {hasPassword && (
          <section>
            <h2>Cambiar contraseña</h2>
            <form className="form" onSubmit={savePassword}>
              <PasswordField
                id="current-password"
                label="Contraseña actual"
                value={current}
                onChange={setCurrent}
              />
              <PasswordField
                id="new-profile-password"
                label="Nueva contraseña"
                value={next}
                onChange={setNext}
              />
              <button className="button">Cambiar contraseña</button>
            </form>
          </section>
        )}
        <section className="danger-zone">
          <h2>Sesión y cuenta</h2>
          <button className="button secondary" onClick={() => void logoutUser()}>
            Cerrar sesión
          </button>
          <button className="text-danger" onClick={() => void deleteAccountSecurely()}>
            Eliminar mi cuenta
          </button>
        </section>
      </div>
    </div>
  )
}

function AuthShell({
  title,
  intro,
  children,
}: {
  title: string
  intro: string
  children: React.ReactNode
}) {
  return (
    <div className="auth-page">
      <div className="auth-intro">
        <p className="eyebrow">SumateRD</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </div>
      <div className="auth-card">{children}</div>
    </div>
  )
}
