import { Facebook, Globe, Instagram, Linkedin, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Author } from '../types'

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.2h1.7L7.4 4.72H5.57L16.67 19.2Z"
      />
    </svg>
  )
}

const SOCIALS: Array<{ key: keyof Author['socials']; label: string; icon: ReactNode }> = [
  { key: 'instagram', label: 'Instagram', icon: <Instagram aria-hidden="true" /> },
  { key: 'facebook', label: 'Facebook', icon: <Facebook aria-hidden="true" /> },
  { key: 'x', label: 'X', icon: <XIcon /> },
  { key: 'linkedin', label: 'LinkedIn', icon: <Linkedin aria-hidden="true" /> },
  { key: 'website', label: 'Sitio web', icon: <Globe aria-hidden="true" /> },
]

export function AuthorAvatar({ author, size = 64 }: { author: Author; size?: number }) {
  return (
    <span className="author-photo" style={{ width: size, height: size }}>
      {author.photoUrl ? (
        <img src={author.photoUrl} alt="" width={size} height={size} loading="lazy" />
      ) : (
        <UserRound aria-hidden="true" />
      )}
    </span>
  )
}

export function AuthorSocialLinks({ author }: { author: Author }) {
  const links = SOCIALS.filter(({ key }) => author.socials?.[key])
  if (!links.length) return null
  return (
    <div className="author-socials">
      {links.map(({ key, label, icon }) => (
        <a
          key={key}
          href={author.socials[key]}
          target="_blank"
          rel="noreferrer"
          aria-label={`${label} de ${author.name}`}
        >
          {icon}
        </a>
      ))}
    </div>
  )
}

export function AuthorBox({ author }: { author: Author }) {
  return (
    <aside className="author-box" aria-label="Sobre el autor">
      <Link to={`/autor/${author.slug}`} tabIndex={-1}>
        <AuthorAvatar author={author} size={72} />
      </Link>
      <div>
        <span className="author-box-label">Escrito por</span>
        <Link to={`/autor/${author.slug}`} className="author-box-name">
          {author.name}
        </Link>
        {author.role && <p className="author-role">{author.role}</p>}
        {author.bio && <p className="author-bio">{author.bio}</p>}
        <AuthorSocialLinks author={author} />
      </div>
    </aside>
  )
}
