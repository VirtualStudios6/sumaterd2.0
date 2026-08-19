import { useEffect, useState, type FormEvent } from 'react'
import { ErrorState, Notice, Spinner } from '../../components/Ui'
import { getSettings, saveSettings } from '../../services/admin'
import type { SiteSettings } from '../../types'
const defaults: SiteSettings = {
  siteName: 'SumateRD',
  tagline: 'República Dominicana en conversación',
  contactEmail: '',
  aboutText:
    'SumateRD es un espacio para informar, conversar y construir propuestas para la República Dominicana.',
  footerText: 'Opinión y sociedad desde República Dominicana.',
}
export function SettingsPage() {
  const [settings, setSettings] = useState(defaults)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    getSettings()
      .then((v) => setSettings(v || defaults))
      .catch(() => setError('No se pudo cargar la configuración.'))
      .finally(() => setLoading(false))
  }, [])
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await saveSettings(settings)
      setMessage('Configuración guardada.')
    } catch {
      setError('No pudimos guardar la configuración.')
    }
  }
  return (
    <>
      <div className="admin-title">
        <div>
          <p>Sitio</p>
          <h1>Configuración</h1>
        </div>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <form className="settings-form form" onSubmit={submit}>
          {error && <ErrorState message={error} />}
          {message && <Notice>{message}</Notice>}
          <section>
            <h2>Información del sitio</h2>
            <label>
              Nombre
              <input
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                required
              />
            </label>
            <label>
              Lema
              <input
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              />
            </label>
            <label>
              Correo de contacto
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              />
            </label>
            <label>
              Texto de presentación
              <textarea
                rows={4}
                maxLength={600}
                value={settings.aboutText || ''}
                onChange={(e) => setSettings({ ...settings, aboutText: e.target.value })}
              />
            </label>
            <label>
              Texto del pie de página
              <input
                maxLength={180}
                value={settings.footerText || ''}
                onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
              />
            </label>
          </section>
          <section>
            <h2>Estado de la administración</h2>
            <Notice>
              El acceso utiliza Firebase Authentication. Las operaciones se autorizan nuevamente en
              el servidor mediante el permiso <code>admin</code>.
            </Notice>
          </section>
          <button className="button">Guardar configuración</button>
        </form>
      )}
    </>
  )
}
