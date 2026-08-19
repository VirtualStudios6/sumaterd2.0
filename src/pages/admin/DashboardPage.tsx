import { useEffect, useState } from 'react'
import { FileText, Images, MessageSquareText, UserRoundCog, Vote } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ErrorState, Spinner } from '../../components/Ui'
import { getAdminArticles, getDashboardCounts } from '../../services/articles'
import type { Article } from '../../types'
import { formatDate } from '../../utils/date'
export function DashboardPage() {
  const [counts, setCounts] = useState<{
    total: number
    published: number
    drafts: number
    panels: number
    users: number
    forumPosts: number
    changeInterests: number
  }>()
  const [recent, setRecent] = useState<Article[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    Promise.all([getDashboardCounts(), getAdminArticles()])
      .then(([c, a]) => {
        setCounts(c)
        setRecent(a.slice(0, 5))
      })
      .catch(() => setError('No se pudo cargar el resumen. Inicia Firebase Emulator Suite.'))
  }, [])
  return (
    <>
      <div className="admin-title">
        <div>
          <p>CMS</p>
          <h1>Resumen editorial</h1>
        </div>
        <Link className="button" to="/admin/articles/new">
          Nuevo artículo
        </Link>
      </div>
      {error && <ErrorState message={error} />}
      {!counts && !error ? (
        <Spinner />
      ) : (
        counts && (
          <div className="metric-grid">
            <div>
              <span>Total artículos</span>
              <strong>{counts.total}</strong>
            </div>
            <div>
              <span>Publicados</span>
              <strong>{counts.published}</strong>
            </div>
            <div>
              <span>Borradores</span>
              <strong>{counts.drafts}</strong>
            </div>
            <div>
              <span>Paneles activos</span>
              <strong>{counts.panels}</strong>
            </div>
            <div>
              <span>Usuarios</span>
              <strong>{counts.users}</strong>
            </div>
            <div>
              <span>Conversaciones</span>
              <strong>{counts.forumPosts}</strong>
            </div>
            <div>
              <span>Solicitudes Cambio</span>
              <strong>{counts.changeInterests}</strong>
            </div>
          </div>
        )
      )}
      <section className="admin-section">
        <h2>Accesos rápidos</h2>
        <div className="admin-quick-grid">
          <Link to="/admin/articles">
            <FileText />
            <span>
              <strong>Contenido</strong>
              <small>Publicar y editar artículos</small>
            </span>
          </Link>
          <Link to="/admin/carousel">
            <Images />
            <span>
              <strong>Portada</strong>
              <small>Ordenar el carrusel</small>
            </span>
          </Link>
          <Link to="/admin/forum">
            <MessageSquareText />
            <span>
              <strong>Foro</strong>
              <small>Moderar conversaciones</small>
            </span>
          </Link>
          <Link to="/admin/users">
            <UserRoundCog />
            <span>
              <strong>Usuarios</strong>
              <small>Gestionar cuentas</small>
            </span>
          </Link>
          <Link to="/admin/change">
            <Vote />
            <span>
              <strong>Cambio</strong>
              <small>Dar seguimiento</small>
            </span>
          </Link>
        </div>
      </section>
      <section className="admin-section">
        <h2>Últimas modificaciones</h2>
        {recent.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Estado</th>
                  <th>Modificado</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <Link to={`/admin/articles/${a.id}/edit`}>{a.title}</Link>
                    </td>
                    <td>
                      <span className={`status-pill ${a.status}`}>
                        {a.status === 'published' ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td>{formatDate(a.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No hay modificaciones para mostrar.</p>
        )}
      </section>
    </>
  )
}
