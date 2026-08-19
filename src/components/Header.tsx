import { Menu, Search, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../app/AuthProvider'
import { CATEGORIES } from '../lib/constants'
import { logoutUser } from '../services/auth'
import { Brand } from './Brand'

export function Header() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  return (
    <header className="site-header">
      <div className="topline">
        <span>República Dominicana</span>
        <span>
          {new Intl.DateTimeFormat('es-DO', {
            dateStyle: 'full',
            timeZone: 'America/Santo_Domingo',
          }).format(new Date())}
        </span>
      </div>
      <div className="header-main container">
        <button
          className="icon-button mobile-only"
          aria-label="Abrir menú"
          onClick={() => setOpen(true)}
        >
          <Menu />
        </button>
        <Brand />
        <nav className="desktop-nav" aria-label="Navegación principal">
          <NavLink to="/">Inicio</NavLink>
          {CATEGORIES.map((c) => (
            <NavLink key={c.slug} to={`/categoria/${c.slug}`}>
              {c.name}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="icon-button" to="/buscar" aria-label="Buscar">
            <Search />
          </Link>
          {user ? (
            <>
              <Link to="/perfil" className="user-link">
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
        </div>
      </div>
      {open && (
        <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Menú">
          <div className="drawer-head">
            <Brand />
            <button className="icon-button" onClick={() => setOpen(false)} aria-label="Cerrar menú">
              <X />
            </button>
          </div>
          <nav onClick={() => setOpen(false)}>
            <NavLink to="/">Inicio</NavLink>
            {CATEGORIES.map((c) => (
              <NavLink key={c.slug} to={`/categoria/${c.slug}`}>
                {c.name}
              </NavLink>
            ))}
            <hr />
            {user ? (
              <Link to="/perfil">Mi perfil</Link>
            ) : (
              <>
                <Link to="/login">Iniciar sesión</Link>
                <Link to="/registro">Crear cuenta</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
