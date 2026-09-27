import { Instagram } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../app/SiteSettingsProvider'
import { CATEGORIES } from '../lib/constants'
import { Brand } from './Brand'

// Añade aquí nuevas redes cuando estén activas; no se muestran enlaces vacíos.
const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/tu.sumaterd',
    icon: Instagram,
  },
  {
    label: 'X',
    href: 'https://x.com/tusumaterd',
    icon: XLogo,
  },
]

function XLogo(props: { 'aria-hidden'?: boolean | 'true' }) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.2h1.7L7.4 4.72H5.57L16.67 19.2Z"
      />
    </svg>
  )
}

export function Footer() {
  const { siteName, footerText } = useSiteSettings()
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Brand />
          <p>{footerText}</p>
          <div className="footer-social">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${label} de ${siteName} (se abre en una pestaña nueva)`}
              >
                <Icon aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
        <nav aria-label="Secciones">
          <strong>Secciones</strong>
          <Link to="/">Inicio</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to={`/categoria/${c.slug}`}>
              {c.name}
            </Link>
          ))}
        </nav>
        <nav aria-label="Información">
          <strong>SumateRD</strong>
          <Link to="/sobre-nosotros">Sobre nosotros</Link>
          <Link to="/privacidad">Privacidad</Link>
          <Link to="/contacto">Contacto</Link>
        </nav>
      </div>
      <div className="container footer-bottom">
        © {new Date().getFullYear()} {siteName}. Todos los derechos reservados.
      </div>
    </footer>
  )
}
