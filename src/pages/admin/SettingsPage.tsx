import { ExternalLink, Save } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ErrorState, Notice, Spinner } from '../../components/Ui'
import { DEFAULT_SITE_SETTINGS } from '../../lib/siteSettings'
import { getSettings, saveSettings } from '../../services/admin'
import type { SiteSettings } from '../../types'

export function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getSettings()
      .then((value) => setSettings({ ...DEFAULT_SITE_SETTINGS, ...(value || {}) }))
      .catch(() => setError('No se pudo cargar la configuración.'))
      .finally(() => setLoading(false))
  }, [])

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }))
    setMessage('')
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      await saveSettings(settings)
      setMessage('Los cambios ya están disponibles en el sitio público.')
    } catch {
      setError('No pudimos guardar la configuración. Revisa tu conexión e inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner label="Cargando configuración" />

  return (
    <>
      <div className="admin-title">
        <div>
          <p>Sitio</p>
          <h1>Configuración general</h1>
        </div>
        <Link className="button secondary" to="/" target="_blank" rel="noreferrer">
          <ExternalLink /> Ver sitio
        </Link>
      </div>
      <p className="admin-page-intro">
        Administra los textos principales, la información institucional y el canal oficial de
        contacto. El carrusel y las publicaciones se gestionan desde sus secciones.
      </p>
      <form className="settings-form form" onSubmit={submit}>
        {error && <ErrorState message={error} />}
        {message && <Notice>{message}</Notice>}

        <section>
          <SectionHeading eyebrow="Identidad" title="Información del sitio">
            Aparece en el encabezado, pie de página y metadatos generales.
          </SectionHeading>
          <div className="settings-grid">
            <Field label="Nombre del sitio">
              <input
                maxLength={80}
                value={settings.siteName}
                onChange={(e) => update('siteName', e.target.value)}
                required
              />
            </Field>
            <Field label="Lema">
              <input
                maxLength={180}
                value={settings.tagline}
                onChange={(e) => update('tagline', e.target.value)}
                required
              />
            </Field>
          </div>
          <Field label="Texto del pie de página">
            <input
              maxLength={180}
              value={settings.footerText}
              onChange={(e) => update('footerText', e.target.value)}
              required
            />
          </Field>
        </section>

        <section>
          <SectionHeading eyebrow="Portada" title="Presentación editorial">
            Los paneles con imágenes se administran desde Carrusel principal.
          </SectionHeading>
          <Field label="Texto superior">
            <input
              maxLength={80}
              value={settings.homeEyebrow}
              onChange={(e) => update('homeEyebrow', e.target.value)}
              required
            />
          </Field>
          <Field label="Título principal">
            <textarea
              rows={2}
              maxLength={180}
              value={settings.homeTitle}
              onChange={(e) => update('homeTitle', e.target.value)}
              required
            />
          </Field>
          <Field label="Descripción">
            <textarea
              rows={3}
              maxLength={500}
              value={settings.homeDescription}
              onChange={(e) => update('homeDescription', e.target.value)}
              required
            />
          </Field>
          <div className="settings-grid">
            <Field label="Texto superior de participación">
              <input
                maxLength={80}
                value={settings.participationEyebrow}
                onChange={(e) => update('participationEyebrow', e.target.value)}
              />
            </Field>
            <Field label="Título de participación">
              <input
                maxLength={180}
                value={settings.participationTitle}
                onChange={(e) => update('participationTitle', e.target.value)}
              />
            </Field>
          </div>
          <Field label="Descripción de participación">
            <textarea
              rows={2}
              maxLength={400}
              value={settings.participationText}
              onChange={(e) => update('participationText', e.target.value)}
            />
          </Field>
        </section>

        <section>
          <SectionHeading eyebrow="Institucional" title="Sobre nosotros">
            Separa los párrafos dejando una línea en blanco.
          </SectionHeading>
          <Field label="Presentación pública">
            <textarea
              rows={8}
              maxLength={4000}
              value={settings.aboutText}
              onChange={(e) => update('aboutText', e.target.value)}
              required
            />
          </Field>
        </section>

        <section>
          <SectionHeading eyebrow="Privacidad" title="Información sobre datos">
            Debe revisarse cuando cambien el registro, el foro o los formularios.
          </SectionHeading>
          <Field label="Fecha de actualización">
            <input
              maxLength={80}
              value={settings.privacyUpdatedAt}
              onChange={(e) => update('privacyUpdatedAt', e.target.value)}
              required
            />
          </Field>
          <Field label="Texto de privacidad">
            <textarea
              rows={12}
              maxLength={8000}
              value={settings.privacyText}
              onChange={(e) => update('privacyText', e.target.value)}
              required
            />
          </Field>
        </section>

        <section>
          <SectionHeading eyebrow="Contacto" title="Canal oficial">
            Usa una dirección que el equipo revise regularmente.
          </SectionHeading>
          <Field label="Correo de contacto">
            <input
              type="email"
              maxLength={254}
              value={settings.contactEmail}
              onChange={(e) => update('contactEmail', e.target.value)}
              placeholder="contacto@dominio.com"
            />
          </Field>
          <Field label="Introducción de contacto">
            <textarea
              rows={4}
              maxLength={1500}
              value={settings.contactText}
              onChange={(e) => update('contactText', e.target.value)}
              required
            />
          </Field>
        </section>

        <div className="settings-save-bar">
          <div>
            <strong>Configuración pública</strong>
            <span>Los cambios se aplican al guardar.</span>
          </div>
          <button className="button" disabled={saving}>
            <Save /> {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      {label}
      {children}
    </label>
  )
}

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="settings-section-heading">
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      <p>{children}</p>
    </div>
  )
}
