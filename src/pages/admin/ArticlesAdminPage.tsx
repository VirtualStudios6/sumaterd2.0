import { Edit3, ExternalLink, Eye, FileText, Plus, Search, Star, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { categoryName } from '../../components/ArticleParts'
import { ConfirmDialog, ErrorState, Notice, Spinner } from '../../components/Ui'
import { deleteAdminArticle, getAdminArticles } from '../../services/articles'
import type { Article, ArticleStatus } from '../../types'
import { formatDate, toDate } from '../../utils/date'

const TABS: Array<{ value: ArticleStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'published', label: 'Publicados' },
  { value: 'draft', label: 'Borradores' },
]

export function ArticlesAdminPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [status, setStatus] = useState<ArticleStatus | 'all'>('all')
  const [term, setTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [deleting, setDeleting] = useState<Article | null>(null)
  const [deletingId, setDeletingId] = useState('')
  const load = useCallback(() => {
    setLoading(true)
    setError('')
    getAdminArticles()
      .then((items) =>
        setArticles(
          [...items].sort(
            (a, b) => (toDate(b.updatedAt)?.getTime() ?? 0) - (toDate(a.updatedAt)?.getTime() ?? 0),
          ),
        ),
      )
      .catch(() => setError('No pudimos cargar los artículos.'))
      .finally(() => setLoading(false))
  }, [])
  useEffect(load, [load])
  const counts = useMemo(
    () => ({
      all: articles.length,
      published: articles.filter((a) => a.status === 'published').length,
      draft: articles.filter((a) => a.status === 'draft').length,
    }),
    [articles],
  )
  const visible = useMemo(() => {
    const needle = term.trim().toLowerCase()
    return articles.filter(
      (a) =>
        (status === 'all' || a.status === status) &&
        `${a.title} ${categoryName(a.category)} ${a.authorName}`.toLowerCase().includes(needle),
    )
  }, [articles, status, term])
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
        <div className="tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              className={status === tab.value ? 'active' : ''}
              key={tab.value}
              role="tab"
              aria-selected={status === tab.value}
              onClick={() => setStatus(tab.value)}
            >
              {tab.label}
              <span className="tab-count">{counts[tab.value]}</span>
            </button>
          ))}
        </div>
        <label className="admin-search">
          <Search aria-hidden="true" />
          <input
            placeholder="Buscar por título, categoría o autor"
            aria-label="Buscar artículos"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </label>
      </div>
      {message && <Notice>{message}</Notice>}
      {error && <ErrorState message={error} />}
      {loading ? (
        <Spinner />
      ) : visible.length ? (
        <ul className="admin-article-list">
          {visible.map((a) => (
            <li key={a.id}>
              <Link
                className="admin-article-thumb"
                to={`/admin/articles/${a.id}/edit`}
                tabIndex={-1}
              >
                {a.coverImage ? (
                  <img src={a.coverImage} alt="" loading="lazy" />
                ) : (
                  <FileText aria-hidden="true" />
                )}
              </Link>
              <div className="admin-article-main">
                <Link to={`/admin/articles/${a.id}/edit`} className="admin-article-title">
                  {a.featured && <Star aria-label="Destacado" className="featured-star" />}
                  {a.title || 'Sin título'}
                </Link>
                <div className="admin-article-meta">
                  <span className={`status-pill ${a.status}`}>
                    {a.status === 'published' ? 'Publicado' : 'Borrador'}
                  </span>
                  <span>{categoryName(a.category)}</span>
                  <span>{a.authorName}</span>
                  <span>
                    {a.status === 'published'
                      ? `Publicado ${formatDate(a.publishedAt)}`
                      : `Editado ${formatDate(a.updatedAt)}`}
                  </span>
                </div>
              </div>
              <div className="table-actions">
                <Link
                  to={`/admin/articles/${a.id}/edit`}
                  aria-label={`Editar ${a.title}`}
                  title="Editar"
                >
                  <Edit3 />
                </Link>
                {a.status === 'published' ? (
                  <a
                    href={`/articulo/${a.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Ver ${a.title} en el sitio`}
                    title="Ver en el sitio"
                  >
                    <ExternalLink />
                  </a>
                ) : (
                  <Link
                    to={`/admin/articles/${a.id}/preview`}
                    aria-label={`Vista previa de ${a.title}`}
                    title="Vista previa"
                  >
                    <Eye />
                  </Link>
                )}
                <button
                  onClick={() => setDeleting(a)}
                  aria-label={`Eliminar ${a.title}`}
                  title="Eliminar"
                  className="danger"
                >
                  <Trash2 />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="admin-empty">
          <FileText aria-hidden="true" />
          <strong>{articles.length ? 'Sin resultados' : 'Aún no hay artículos'}</strong>
          <p>
            {articles.length
              ? 'Prueba con otra búsqueda o cambia de pestaña.'
              : 'Escribe el primero y publícalo cuando esté listo.'}
          </p>
          {!articles.length && (
            <Link className="button" to="/admin/articles/new">
              <Plus /> Nuevo artículo
            </Link>
          )}
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
