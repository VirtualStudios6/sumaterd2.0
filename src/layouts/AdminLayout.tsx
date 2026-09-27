import {
  ExternalLink,
  FileText,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  PenSquare,
  Settings,
  UserRoundCog,
  Vote,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { Spinner } from '../components/Ui'
import { useAdmin } from '../features/admin/AdminProvider'
import '../admin.css'

export function AdminLayout() {
  const { authenticated, loading, logout, user } = useAdmin()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
  if (loading) return <Spinner label="Verificando acceso administrativo" />
  if (!authenticated) return <Navigate to="/admin/login" replace />
  const signOut = () => {
    void logout()
    navigate('/admin/login')
  }
  const email = user?.email || ''
  const links = (
    <>
      <NavLink to="/admin" end>
        <LayoutDashboard /> Resumen
      </NavLink>
      <NavLink to="/admin/articles">
        <FileText /> Artículos
      </NavLink>
      <NavLink to="/admin/authors">
        <PenSquare /> Autores
      </NavLink>
      <NavLink to="/admin/carousel">
        <Images /> Portada
      </NavLink>
      <NavLink to="/admin/forum">
        <MessageSquareText /> Foro
      </NavLink>
      <NavLink to="/admin/users">
        <UserRoundCog /> Usuarios
      </NavLink>
      <NavLink to="/admin/change">
        <Vote /> Cambio
      </NavLink>
      <NavLink to="/admin/settings">
        <Settings /> Configuración
      </NavLink>
    </>
  )
  const foot = (
    <div className="admin-sidebar-foot">
      <div className="admin-user">
        <span aria-hidden="true">{email.charAt(0) || 'A'}</span>
        <div>
          <strong>Administrador</strong>
          <small>{email}</small>
        </div>
      </div>
      <a href="/" target="_blank" rel="noreferrer">
        <ExternalLink /> Ver sitio
      </a>
      <button onClick={signOut}>
        <LogOut /> Cerrar sesión
      </button>
    </div>
  )
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Brand />
        <p className="admin-nav-label">Gestión</p>
        <nav aria-label="Administración">{links}</nav>
        {foot}
      </aside>
      <header className="admin-mobile-head">
        <Brand />
        <button className="icon-button" onClick={() => setOpen(true)} aria-label="Abrir menú">
          <Menu />
        </button>
      </header>
      {open && (
        <div className="admin-mobile-nav" role="dialog" aria-modal="true" aria-label="Menú">
          <button onClick={() => setOpen(false)} aria-label="Cerrar menú">
            <X />
          </button>
          <nav aria-label="Administración">{links}</nav>
          {foot}
        </div>
      )}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
