import { Link } from 'react-router-dom'
import { useSiteSettings } from '../app/SiteSettingsProvider'
export function Brand() {
  const { siteName } = useSiteSettings()
  return (
    <Link to="/" className="brand" aria-label={`${siteName}, inicio`}>
      <img
        className="brand-logo"
        src={`${import.meta.env.BASE_URL}brand/logo.png`}
        alt={siteName}
      />
    </Link>
  )
}
