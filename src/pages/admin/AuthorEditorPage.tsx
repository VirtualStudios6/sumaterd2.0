import { ArrowLeft, ExternalLink, Facebook, Globe, Instagram, Linkedin } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ImageUploader } from '../../components/ImageUploader'
import { ErrorState, Notice, Spinner } from '../../components/Ui'
import { getAdminAuthor, getArticlesByAuthor, saveAdminAuthor } from '../../services/authors'
import type { Article, Author, AuthorSocials } from '../../types'
import { formatDate } from '../../utils/date'

type AuthorDraft = Omit<Author, 'id' | 'slug'> & { id?: string; slug?: string }

const blank: AuthorDraft = { name: '', role: '', bio: '', photoUrl: '', socials: {} }

const SOCIAL_FIELDS: Array<{ key: keyof AuthorSocials; label: string; icon: typeof Globe }> = [
  { key: 'instagram', label: 'Instagram', icon: Instagram },
  { key: 'facebook', label: 'Facebook', icon: Facebook },
  { key: 'x', label: 'X (Twitter)', icon: Globe },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { key: 'website', label: 'Sitio web', icon: Globe },
]

export function AuthorEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const temporaryId = useRef(crypto.randomUUID()).current
  const [draft, setDraft] = useState<AuthorDraft>(blank)
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [articles, setArticles] = useState<Article[]>([])
  const ownerId = id || temporaryId
  useEffect(() => {
    if (!id) return
    getAdminAuthor(id)
      .then((author) => (author ? setDraft(author) : setError('El autor no existe.')))
      .catch(() => setError('No pudimos cargar el autor.'))
      .finally(() => setLoading(false))
    getArticlesByAuthor(id)
      .then(setArticles)
      .catch(() => setArticles([]))
  }, [id])
  const set = <K extends keyof AuthorDraft>(key: K, value: AuthorDraft[K]) => {
    setSaved(false)
    setDraft((d) => ({ ...d, [key]: value }))
  }
  const setSocial = (key: keyof AuthorSocials, value: string) =>
    set('socials', { ...draft.socials, [key]: value })
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (draft.name.trim().length < 2) return setError('Escribe el nombre del autor.')
    setSaving(true)
    setError('')
    try {
      const result = await saveAdminAuthor({ ...draft, id: ownerId })
      setDraft((d) => ({ ...d, id: result.id, slug: result.slug }))
      setSaved(true)
      if (!id) navigate(`/admin/authors/${result.id}/edit`, { replace: true })
    } catch {
      setError('No pudimos guardar el autor.')
    } finally {
      setSaving(false)
    }
  }
  if (loading) return <Spinner label="Cargando autor" />
  return (
    <>
      <div className="admin-title">
        <div>
          <Link className="admin-back" to="/admin/authors">
            <ArrowLeft aria-hidden="true" /> Autores
          </Link>
          <h1>{id ? draft.name || 'Editar autor' : 'Nuevo autor'}</h1>
        </div>
        {draft.slug && (
          <a
            className="button secondary small"
            href={`/autor/${draft.slug}`}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink aria-hidden="true" /> Ver perfil
          </a>
        )}
      </div>
      {error && <ErrorState message={error} />}
      {saved && <Notice>Autor guardado. Sus artículos muestran ya estos datos.</Notice>}
      <form className="editor author-editor" onSubmit={(e) => void submit(e)}>
        <div className="editor-main">
          <div className="editor-pair">
            <label>
              Nombre
              <input
                value={draft.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Ej. María Rodríguez"
                maxLength={100}
                required
              />
            </label>
            <label>
              Cargo / profesión
              <input
                value={draft.role}
                onChange={(e) => set('role', e.target.value)}
                placeholder="Ej. Periodista y analista social"
                maxLength={120}
              />
            </label>
          </div>
          <label>
            Biografía
            <textarea
              rows={6}
              value={draft.bio}
              onChange={(e) => set('bio', e.target.value)}
              placeholder="Breve presentación que aparecerá al final de cada artículo."
              maxLength={1500}
            />
            <small className="field-meta">
              <span>Se muestra en sus artículos y en su perfil público.</span>
              <span>{draft.bio.length}/1500</span>
            </small>
          </label>
          <fieldset className="social-fields">
            <legend>Redes sociales</legend>
            {SOCIAL_FIELDS.map(({ key, label, icon: Icon }) => (
              <label key={key}>
                <span>
                  <Icon aria-hidden="true" /> {label}
                </span>
                <input
                  value={draft.socials[key] || ''}
                  onChange={(e) => setSocial(key, e.target.value)}
                  placeholder="https://"
                  inputMode="url"
                />
              </label>
            ))}
          </fieldset>
        </div>
        <aside className="editor-side">
          <section>
            <h2>Foto</h2>
            <ImageUploader
              value={draft.photoUrl}
              alt={draft.name}
              area="authors"
              ownerId={ownerId}
              kind="photo"
              onChange={(url) => set('photoUrl', url)}
            />
            <small className="side-hint">Cuadrada, al menos 400 × 400 px.</small>
          </section>
          <section>
            <button className="button full" type="submit" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar autor'}
            </button>
          </section>
          {id && (
            <section>
              <h2>Artículos publicados ({articles.length})</h2>
              {articles.length ? (
                <ul className="author-articles">
                  {articles.map((a) => (
                    <li key={a.id}>
                      <Link to={'/admin/articles/' + a.id + '/edit'}>{a.title}</Link>
                      <small>{formatDate(a.publishedAt)}</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <small className="side-hint">Todavía no tiene artículos publicados.</small>
              )}
            </section>
          )}
        </aside>
      </form>
    </>
  )
}
