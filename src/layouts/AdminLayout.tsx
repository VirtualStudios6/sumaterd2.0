import {
  FileText,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Settings,
  UserRoundCog,
  Vote,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { Spinner } from '../components/Ui'
import { useAdmin } from '../features/admin/AdminProvider'

export function AdminLayout() {
  const { authenticated, loading, logout, user } = useAdmin()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  if (loading) return <Spinner label="Verificando acceso administrativo" />
  if (!authenticated) return <Navigate to="/admin/login" replace />
  const links = (
    <>
      <NavLink to="/admin" end>
        <LayoutDashboard /> Resumen
      </NavLink>
      <NavLink to="/admin/articles">
        <FileText /> Artículos
      </NavLink>
      <NavLink to="/admin/carousel">
        <Images /> Carrusel
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
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Brand />
        <nav>{links}</nav>
        <button
          onClick={() => {
            void logout()
            navigate('/admin/login')
          }}
        >
          <LogOut /> Cerrar sesión
        </button>
      </aside>
      <header className="admin-mobile-head">
        <Brand />
        <button className="icon-button" onClick={() => setOpen(true)}>
          <Menu />
        </button>
      </header>
      {open && (
        <div className="admin-mobile-nav">
          <button onClick={() => setOpen(false)}>
            <X />
          </button>
          <nav onClick={() => setOpen(false)}>{links}</nav>
        </div>
      )}
      <main className="admin-content">
        <div className="admin-session-bar">
          <span>Sesión protegida</span>
          <strong>{user?.email}</strong>
          <Link to="/" target="_blank" rel="noreferrer">
            Ver sitio público
          </Link>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
