import { Home, LogOut, Menu, MessageCircle, Search, UserRound, Vote, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../app/AuthProvider'
import { CATEGORIES } from '../lib/constants'
import { logoutUser } from '../services/auth'
import { Brand } from './Brand'

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
              {CATEGORIES.map((c) => (
                <NavLink key={c.slug} to={`/categoria/${c.slug}`}>
                  {c.name}
                </NavLink>
              ))}
              <NavLink to="/buscar">Buscar</NavLink>
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
