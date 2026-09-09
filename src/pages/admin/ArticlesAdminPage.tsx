import { Edit3, Eye, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmDialog, ErrorState, Notice, Spinner } from '../../components/Ui'
import { deleteAdminArticle, getAdminArticles } from '../../services/articles'
import type { Article, ArticleStatus } from '../../types'
import { formatDate } from '../../utils/date'
export function ArticlesAdminPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [status, setStatus] = useState<ArticleStatus | 'all'>('all')
  const [term, setTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [deleting, setDeleting] = useState<Article | null>(null)
  const [deletingId, setDeletingId] = useState('')
  const load = () => {
    setLoading(true)
    getAdminArticles(status === 'all' ? undefined : status)
      .then(setArticles)
      .catch(() => setError('No pudimos cargar los artículos.'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [status])
  const visible = useMemo(
    () =>
      articles.filter((a) =>
        `${a.title} ${a.category} ${a.authorName}`.toLowerCase().includes(term.toLowerCase()),
      ),
    [articles, term],
  )
  const confirmDelete = async () => {
    if (!deleting) return
    setDeletingId(deleting.id)
    setError('')
    try {
      await deleteAdminArticle(deleting.id)
      setDeleting(null)
      setMessage('Artículo eliminado correctamente.')
      load()
    } catch {
      setError('No se pudo eliminar el artículo. Intenta nuevamente.')
    } finally {
      setDeletingId('')
    }
  }
  return (
    <>
      <div className="admin-title">
        <div>
          <p>Contenido</p>
          <h1>Artículos</h1>
        </div>
        <Link className="button" to="/admin/articles/new">
          <Plus /> Nuevo artículo
        </Link>
      </div>
      <div className="toolbar">
        <div className="tabs">
          {(['all', 'published', 'draft'] as const).map((s) => (
            <button className={status === s ? 'active' : ''} key={s} onClick={() => setStatus(s)}>
              {s === 'all' ? 'Todos' : s === 'published' ? 'Publicados' : 'Borradores'}
            </button>
          ))}
        </div>
        <label className="admin-search">
          <Search />
          <input
            placeholder="Buscar artículos"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </label>
      </div>
      {message && <Notice>{message}</Notice>}
      {error && <ErrorState message={error} />}
      {loading ? (
        <Spinner />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Publicación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>{a.title}</strong>
                    <small>{a.authorName}</small>
                  </td>
                  <td>{a.category}</td>
                  <td>
                    <span className={`status-pill ${a.status}`}>
                      {a.status === 'published' ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>
                  <td>{formatDate(a.publishedAt)}</td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/admin/articles/${a.id}/edit`} aria-label="Editar">
                        <Edit3 />
                      </Link>
                      <Link to={`/admin/articles/${a.id}/preview`} aria-label="Vista previa">
                        <Eye />
                      </Link>
                      <button onClick={() => setDeleting(a)} aria-label={`Eliminar ${a.title}`}>
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length && <p className="table-empty">No hay artículos en esta vista.</p>}
        </div>
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="¿Eliminar este artículo?"
        onCancel={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
        busy={Boolean(deletingId)}
      >
        {deleting ? `Eliminarás “${deleting.title}”. Esta acción no se puede deshacer.` : ''}
      </ConfirmDialog>
    </>
  )
}
