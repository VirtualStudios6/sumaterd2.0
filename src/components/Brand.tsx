import { Link } from 'react-router-dom'
import { useSiteSettings } from '../app/SiteSettingsProvider'
export function Brand() {
  const { siteName } = useSiteSettings()
  const hasRdEnding = /rd$/i.test(siteName)
  const first = hasRdEnding ? siteName.slice(0, -2) : siteName
  return (
    <Link to="/" className="brand" aria-label={`${siteName}, inicio`}>
      <span>{first}</span>
      {hasRdEnding && <b>{siteName.slice(-2)}</b>}
    </Link>
  )
}
