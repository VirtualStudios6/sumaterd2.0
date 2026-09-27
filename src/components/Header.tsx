import {
  Facebook,
  Home,
  Instagram,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  UserRound,
  Vote,
  X,
  Youtube,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../app/AuthProvider'
import { CATEGORIES } from '../lib/constants'
import { logoutUser } from '../services/auth'
import { Brand } from './Brand'

// Para activar una red, pon su URL en `href`.
const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/tu.sumaterd',
    className: 'instagram',
    icon: <Instagram aria-hidden="true" />,
  },
  { label: 'Facebook', href: '', className: 'facebook', icon: <Facebook aria-hidden="true" /> },
  {
    label: 'X',
    href: 'https://x.com/tusumaterd',
    className: 'x',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.2h1.7L7.4 4.72H5.57L16.67 19.2Z"
        />
      </svg>
    ),
  },
  { label: 'YouTube', href: '', className: 'youtube', icon: <Youtube aria-hidden="true" /> },
]

// Ya están en la barra inferior de la app; no se repiten en el menú lateral.
const DRAWER_HIDDEN = ['opinion', 'cambio']

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user } = useAuth()
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])
  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="header-main container">
        <Brand />
        <nav className="desktop-nav" aria-label="Navegación principal">
          <NavLink to="/" end>
            Inicio
          </NavLink>
          {CATEGORIES.map((c) => (
            <NavLink key={c.slug} to={`/categoria/${c.slug}`}>
              {c.name}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="icon-button desktop-only" to="/buscar" aria-label="Buscar">
            <Search />
          </Link>
          {user ? (
            <>
              <Link to="/perfil" className="user-link desktop-only">
                <UserRound /> Perfil
              </Link>
              <button className="text-button desktop-only" onClick={() => void logoutUser()}>
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-button desktop-only">
                Iniciar sesión
              </Link>
              <Link to="/registro" className="button small desktop-only">
                Crear cuenta
              </Link>
            </>
          )}
          <button
            className="icon-button mobile-only"
            aria-label="Abrir menú"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>
        </div>
      </div>
      <div className="social-strip">
        {SOCIAL_LINKS.map(({ label, href, className, icon }) => (
          <a
            key={label}
            className={`social-strip-icon ${className}`}
            href={href || '#'}
            onClick={href ? undefined : (event) => event.preventDefault()}
            target={href ? '_blank' : undefined}
            rel={href ? 'noreferrer' : undefined}
            aria-label={
              href
                ? `${label} de SumateRD (se abre en una pestaña nueva)`
                : `${label} de SumateRD (próximamente)`
            }
          >
            {icon}
          </a>
        ))}
      </div>
      {open && (
        <div className="mobile-menu-layer" onClick={() => setOpen(false)}>
          <div
            className="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-head">
              <Brand />
              <button
                className="icon-button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
              >
                <X />
              </button>
            </div>
            <nav>
              <NavLink to="/" end>
                Inicio
              </NavLink>
              {CATEGORIES.filter((c) => !DRAWER_HIDDEN.includes(c.slug)).map((c) => (
                <NavLink key={c.slug} to={`/categoria/${c.slug}`}>
                  {c.name}
                </NavLink>
              ))}
            </nav>
            <div className="drawer-account">
              {user ? (
                <>
                  <Link className="button secondary full" to="/perfil">
                    <UserRound /> Mi perfil
                  </Link>
                  <button className="button ghost full" onClick={() => void logoutUser()}>
                    <LogOut /> Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link className="button full" to="/registro">
                    Crear cuenta
                  </Link>
                  <Link className="button secondary full" to="/login">
                    Iniciar sesión
                  </Link>
                </>
              )}
            </div>
            <nav className="drawer-legal" aria-label="Información">
              <Link to="/sobre-nosotros">Sobre nosotros</Link>
              <Link to="/privacidad">Privacidad</Link>
              <Link to="/contacto">Contacto</Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

export function MobileTabBar() {
  const { user } = useAuth()
  const tabs = [
    { to: '/', label: 'Inicio', icon: Home, end: true },
    { to: '/categoria/opinion', label: 'Foro', icon: MessageCircle },
    { to: '/categoria/cambio', label: 'Cambio', icon: Vote },
    { to: '/buscar', label: 'Buscar', icon: Search },
    { to: user ? '/perfil' : '/login', label: user ? 'Perfil' : 'Entrar', icon: UserRound },
  ]
  return (
    <nav className="tab-bar" aria-label="Navegación de la app">
      {tabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={label} to={to} end={end}>
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
