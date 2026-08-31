import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../app/SiteSettingsProvider'
export function AboutPage() {
  const { aboutText } = useSiteSettings()
  return (
    <Info title="Sobre nosotros">
      <TextBlocks value={aboutText} />
    </Info>
  )
}
export function PrivacyPage() {
  const { privacyText, privacyUpdatedAt, contactEmail } = useSiteSettings()
  return (
    <Info title="Privacidad">
      {privacyUpdatedAt && <p className="info-updated">Última actualización: {privacyUpdatedAt}</p>}
      <TextBlocks value={privacyText} />
      {contactEmail && (
        <p>
          Para ejercer tus derechos o realizar una consulta, escribe a{' '}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      )}
    </Info>
  )
}
export function ContactPage() {
  const { contactEmail, contactText } = useSiteSettings()
  return (
    <Info title="Contacto">
      <TextBlocks value={contactText} />
      {contactEmail ? (
        <p>
          Puedes escribirnos a <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      ) : (
        <p>El equipo administrador debe configurar el correo oficial desde el panel.</p>
      )}
    </Info>
  )
}

function TextBlocks({ value }: { value: string }) {
  return value
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((paragraph) => <p key={paragraph}>{paragraph}</p>)
}
export function NotFoundPage() {
  return (
    <div className="container not-found">
      <span>404</span>
      <h1>No encontramos esta página.</h1>
      <p>La dirección puede haber cambiado o el contenido ya no está disponible.</p>
      <Link className="button" to="/">
        Volver al inicio
      </Link>
    </div>
  )
}
function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="container narrow info-page">
      <Helmet>
        <title>{title} — SumateRD</title>
      </Helmet>
      <p className="eyebrow">SumateRD</p>
      <h1>{title}</h1>
      {children}
    </div>
  )
}
