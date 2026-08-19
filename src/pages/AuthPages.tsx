import {
  BadgeCheck,
  CalendarDays,
  Eye,
  EyeOff,
  LogOut,
  Mail,
  MapPin,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react'
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
  updateProfileDetails,
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

const DOMINICAN_PROVINCES = [
  'Azua',
  'Bahoruco',
  'Barahona',
  'Dajabón',
  'Distrito Nacional',
  'Duarte',
  'Elías Piña',
  'El Seibo',
  'Espaillat',
  'Hato Mayor',
  'Hermanas Mirabal',
  'Independencia',
  'La Altagracia',
  'La Romana',
  'La Vega',
  'María Trinidad Sánchez',
  'Monseñor Nouel',
  'Monte Cristi',
  'Monte Plata',
  'Pedernales',
  'Peravia',
  'Puerto Plata',
  'Samaná',
  'San Cristóbal',
  'San José de Ocoa',
  'San Juan',
  'San Pedro de Macorís',
  'Sánchez Ramírez',
  'Santiago',
  'Santiago Rodríguez',
  'Santo Domingo',
  'Valverde',
] as const

export function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [details, setDetails] = useState({
    fullName: '',
    phone: '',
    province: '',
    municipality: '',
    bio: '',
  })
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const hasPassword = user?.providerData.some((provider) => provider.providerId === 'password')
  useEffect(() => {
    if (user)
      getProfile(user.uid)
        .then((p) => {
          setProfile(p)
          setDetails({
            fullName: p?.fullName || user.displayName || '',
            phone: p?.phone || '',
            province: p?.province || '',
            municipality: p?.municipality || '',
            bio: p?.bio || '',
          })
        })
        .catch(() => setError('No pudimos cargar el perfil.'))
        .finally(() => setProfileLoading(false))
  }, [user])
  if (authLoading)
    return (
      <div className="container page">
        <Spinner />
      </div>
    )
  if (!user) return <Navigate to="/login" replace />
  const saveDetails = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      await updateProfileDetails(user.uid, details)
      setProfile((currentProfile) =>
        currentProfile ? { ...currentProfile, ...details, updatedAt: new Date() } : currentProfile,
      )
      setMessage('Tu perfil fue actualizado correctamente.')
    } catch {
      setError('No pudimos actualizar el perfil. Revisa los datos e intenta nuevamente.')
    } finally {
      setSaving(false)
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
  const deleteProfile = async () => {
    if (!window.confirm('¿Seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.'))
      return
    setDeleting(true)
    setError('')
    try {
      await deleteAccountSecurely()
    } catch {
      setError('No pudimos eliminar la cuenta. Intenta iniciar sesión nuevamente.')
      setDeleting(false)
    }
  }
  const initials = (profile?.fullName || user.displayName || 'SR')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
  const providerLabel = hasPassword ? 'Correo y contraseña' : 'Google'
  const completedFields = [
    details.fullName,
    user.email,
    details.phone,
    details.province,
    details.municipality,
    details.bio,
  ].filter(Boolean).length
  const completion = Math.round((completedFields / 6) * 100)
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
      {profileLoading ? (
        <Spinner />
      ) : profile ? (
        <>
          <section className="profile-summary-card">
            <div className="profile-avatar" aria-hidden="true">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="profile-identity">
              <p>Tu cuenta en SumateRD</p>
              <h2>{profile.fullName}</h2>
              <div className="profile-badges">
                <span>
                  <BadgeCheck aria-hidden="true" /> Cuenta activa
                </span>
                <span>
                  <ShieldCheck aria-hidden="true" /> Acceso con {providerLabel}
                </span>
              </div>
            </div>
            <div className="profile-completion">
              <div>
                <strong>{completion}%</strong>
                <span>Perfil completado</span>
              </div>
              <div
                className="profile-progress"
                role="progressbar"
                aria-label="Perfil completado"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={completion}
              >
                <span style={{ width: `${completion}%` }} />
              </div>
              {completion < 100 && (
                <small>Completa tus datos para que tu perfil sea más útil.</small>
              )}
            </div>
          </section>

          <div className="profile-layout">
            <section className="profile-details-card">
              <div className="profile-section-heading">
                <UserRound aria-hidden="true" />
                <div>
                  <h2>Información personal</h2>
                  <p>Estos datos no se muestran públicamente.</p>
                </div>
              </div>
              <form className="form" onSubmit={saveDetails}>
                <div className="profile-form-grid">
                  <label>
                    Nombre completo
                    <input
                      value={details.fullName}
                      onChange={(e) => setDetails({ ...details, fullName: e.target.value })}
                      autoComplete="name"
                      required
                      minLength={3}
                      maxLength={100}
                    />
                  </label>
                  <label>
                    Teléfono
                    <input
                      type="tel"
                      value={details.phone}
                      onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                      autoComplete="tel"
                      placeholder="809-000-0000"
                      maxLength={24}
                    />
                  </label>
                  <label>
                    Provincia
                    <select
                      value={details.province}
                      onChange={(e) => setDetails({ ...details, province: e.target.value })}
                    >
                      <option value="">Selecciona una provincia</option>
                      {DOMINICAN_PROVINCES.map((province) => (
                        <option value={province} key={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Municipio
                    <input
                      value={details.municipality}
                      onChange={(e) => setDetails({ ...details, municipality: e.target.value })}
                      autoComplete="address-level2"
                      maxLength={80}
                    />
                  </label>
                </div>
                <label>
                  Sobre mí
                  <textarea
                    value={details.bio}
                    onChange={(e) => setDetails({ ...details, bio: e.target.value })}
                    placeholder="Cuéntanos brevemente qué temas te interesan o cómo quieres aportar."
                    maxLength={280}
                    rows={4}
                  />
                  <small className="field-counter">{details.bio.length}/280</small>
                </label>
                <button className="button profile-save-button" disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar información'}
                </button>
              </form>
            </section>

            <div className="profile-side-stack">
              <section className="profile-account-card">
                <div className="profile-section-heading compact">
                  <ShieldCheck aria-hidden="true" />
                  <div>
                    <h2>Cuenta y seguridad</h2>
                    <p>Información de acceso.</p>
                  </div>
                </div>
                <dl>
                  <div>
                    <dt>
                      <Mail aria-hidden="true" /> Correo
                    </dt>
                    <dd>{profile.email}</dd>
                  </div>
                  <div>
                    <dt>
                      <BadgeCheck aria-hidden="true" /> Verificación
                    </dt>
                    <dd>{user.emailVerified ? 'Correo verificado' : 'Pendiente'}</dd>
                  </div>
                  <div>
                    <dt>
                      <ShieldCheck aria-hidden="true" /> Método de acceso
                    </dt>
                    <dd>{providerLabel}</dd>
                  </div>
                  <div>
                    <dt>
                      <CalendarDays aria-hidden="true" /> Miembro desde
                    </dt>
                    <dd>{formatDate(profile.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>
                      <MapPin aria-hidden="true" /> Cédula
                    </dt>
                    <dd>{profile.cedulaMasked}</dd>
                  </div>
                </dl>
              </section>

              {hasPassword ? (
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
                    <button className="button full">Cambiar contraseña</button>
                  </form>
                </section>
              ) : (
                <section className="profile-provider-note">
                  <ShieldCheck aria-hidden="true" />
                  <div>
                    <h2>Protegida por Google</h2>
                    <p>
                      La contraseña y la seguridad de acceso se administran desde tu cuenta de
                      Google.
                    </p>
                  </div>
                </section>
              )}

              <section className="danger-zone">
                <h2>Sesión y cuenta</h2>
                <p>Cierra tu sesión en este dispositivo o elimina definitivamente la cuenta.</p>
                <button className="button secondary full" onClick={() => void logoutUser()}>
                  <LogOut aria-hidden="true" /> Cerrar sesión
                </button>
                <button
                  className="text-danger"
                  disabled={deleting}
                  onClick={() => void deleteProfile()}
                >
                  <Trash2 aria-hidden="true" /> {deleting ? 'Eliminando…' : 'Eliminar mi cuenta'}
                </button>
              </section>
            </div>
          </div>
        </>
      ) : (
        <ErrorState message="No encontramos la información de tu perfil. Cierra sesión e inicia nuevamente." />
      )}
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
