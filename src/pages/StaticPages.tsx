import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../app/SiteSettingsProvider'
export function AboutPage() {
  const { aboutText } = useSiteSettings()
  return (
    <Info title="Sobre nosotros">
      <p>{aboutText}</p>
    </Info>
  )
}
export function PrivacyPage() {
  return (
    <Info title="Privacidad">
      <div className="notice">Documento base pendiente de revisión legal antes de producción.</div>
      <p>
        SumateRD utiliza los datos de cuenta para autenticar usuarios y gestionar su perfil. La
        cédula se valida y se reserva mediante un identificador no público; nunca almacenamos
        contraseñas en Firestore.
      </p>
      <p>
        En Proyecto Cambio recopilamos únicamente los datos que la persona envía voluntariamente
        para conocer su interés, sus ideas y la forma en que desea participar. Esta información es
        privada y su envío no constituye afiliación formal a un partido político.
      </p>
      <p>
        La versión final deberá identificar al responsable del tratamiento, plazos de conservación,
        base jurídica y canales formales para ejercer derechos.
      </p>
    </Info>
  )
}
export function ContactPage() {
  const { contactEmail } = useSiteSettings()
  return (
    <Info title="Contacto">
      {contactEmail ? (
        <p>
          Puedes escribirnos a <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      ) : (
        <p>El canal de contacto oficial será publicado próximamente.</p>
      )}
    </Info>
  )
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
