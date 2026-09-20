import { Link } from 'react-router-dom'
import { useSiteSettings } from '../app/SiteSettingsProvider'
import { CATEGORIES } from '../lib/constants'
import { Brand } from './Brand'
export function Footer() {
  const { siteName, footerText } = useSiteSettings()
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Brand />
          <p>{footerText}</p>
        </div>
        <nav aria-label="Secciones">
          <Link to="/">Inicio</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to={`/categoria/${c.slug}`}>
              {c.name}
            </Link>
          ))}
        </nav>
        <nav aria-label="Información">
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
