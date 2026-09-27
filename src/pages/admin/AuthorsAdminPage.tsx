import { Edit3, ExternalLink, Plus, Trash2, UserRound } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmDialog, ErrorState, Notice, Spinner } from '../../components/Ui'
import { deleteAdminAuthor, listAdminAuthors } from '../../services/authors'
import type { Author } from '../../types'

export function AuthorsAdminPage() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [deleting, setDeleting] = useState<Author | null>(null)
  const [busy, setBusy] = useState(false)
  const load = useCallback(() => {
    setLoading(true)
    listAdminAuthors()
      .then(setAuthors)
      .catch(() => setError('No pudimos cargar los autores.'))
      .finally(() => setLoading(false))
  }, [])
  useEffect(load, [load])
  const confirmDelete = async () => {
    if (!deleting) return
    setBusy(true)
    setError('')
    try {
      await deleteAdminAuthor(deleting.id)
      setMessage('Autor eliminado.')
      setDeleting(null)
      load()
    } catch (err) {
      const text = err instanceof Error ? err.message : ''
      setError(text.includes('artículos') ? text : 'No se pudo eliminar el autor.')
      setDeleting(null)
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <div className="admin-title">
        <div>
          <p>Contenido</p>
          <h1>Autores</h1>
        </div>
        <Link className="button" to="/admin/authors/new">
          <Plus /> Nuevo autor
        </Link>
      </div>
      {message && <Notice>{message}</Notice>}
      {error && <ErrorState message={error} />}
      {loading ? (
        <Spinner />
      ) : authors.length ? (
        <ul className="admin-article-list author-list">
          {authors.map((author) => (
            <li key={author.id}>
              <Link
                className="admin-article-thumb author-avatar"
                to={`/admin/authors/${author.id}/edit`}
                tabIndex={-1}
              >
                {author.photoUrl ? (
                  <img src={author.photoUrl} alt="" loading="lazy" />
                ) : (
                  <UserRound aria-hidden="true" />
                )}
              </Link>
              <div className="admin-article-main">
                <Link to={`/admin/authors/${author.id}/edit`} className="admin-article-title">
                  {author.name}
                </Link>
                <div className="admin-article-meta">
                  {author.role && <span>{author.role}</span>}
                  <span>
                    {author.publishedCount ?? 0}{' '}
                    {author.publishedCount === 1 ? 'artículo publicado' : 'artículos publicados'}
                  </span>
                </div>
              </div>
              <div className="table-actions">
                <Link
                  to={`/admin/authors/${author.id}/edit`}
                  aria-label={`Editar ${author.name}`}
                  title="Editar"
                >
                  <Edit3 />
                </Link>
                <a
                  href={`/autor/${author.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Ver perfil público de ${author.name}`}
                  title="Ver perfil público"
                >
                  <ExternalLink />
                </a>
                <button
                  className="danger"
                  onClick={() => setDeleting(author)}
                  aria-label={`Eliminar ${author.name}`}
                  title="Eliminar"
                >
                  <Trash2 />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="admin-empty">
          <UserRound aria-hidden="true" />
          <strong>Aún no hay autores</strong>
          <p>Crea un perfil una vez y selecciónalo en cada artículo.</p>
          <Link className="button" to="/admin/authors/new">
            <Plus /> Nuevo autor
          </Link>
        </div>
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="¿Eliminar este autor?"
        onCancel={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
        busy={busy}
      >
        {deleting
          ? `Eliminarás el perfil de “${deleting.name}”. Solo es posible si no tiene artículos.`
          : ''}
      </ConfirmDialog>
    </>
  )
}
