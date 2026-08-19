import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ErrorState, Notice, Spinner } from '../../components/Ui'
import { ImageUploader } from '../../components/ImageUploader'
import { CATEGORIES } from '../../lib/constants'
import { getArticleById, saveAdminArticle } from '../../services/articles'
import type { Article, ArticleStatus, CategorySlug } from '../../types'
import { keywordsFrom, normalizeTags, readingTime, slugify } from '../../utils/content'

type Draft = Partial<Article> & {
  title: string
  slug: string
  summary: string
  content: string
  coverImage: string
  coverImageAlt: string
  authorName: string
  category: CategorySlug
  tags: string[]
  status: ArticleStatus
  featured: boolean
}
const blank: Draft = {
  title: '',
  slug: '',
  summary: '',
  content: '',
  coverImage: '',
  coverImageAlt: '',
  authorName: 'Redacción SumateRD',
  category: 'sociedad',
  tags: [],
  status: 'draft',
  featured: false,
  seoTitle: '',
  seoDescription: '',
}

export function ArticleEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const temporaryOwnerId = useRef(crypto.randomUUID()).current
  const [draft, setDraft] = useState<Draft>(blank)
  const [contentImageAlt, setContentImageAlt] = useState('')
  const [loading, setLoading] = useState(Boolean(id))
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState('')
  const initialized = useRef(false)
  const ownerId = id || draft.id || temporaryOwnerId
  useEffect(() => {
    if (!id) {
      initialized.current = true
      return
    }
    getArticleById(id)
      .then((a) => {
        if (a) setDraft(a)
        else setError('El artículo no existe.')
      })
      .catch(() => setError('No pudimos cargar el artículo.'))
      .finally(() => {
        setLoading(false)
        setTimeout(() => {
          initialized.current = true
        }, 0)
      })
  }, [id])
  useEffect(() => {
    if (!initialized.current || !id) return
    setSaveState('saving')
    const timer = setTimeout(() => {
      const payload = {
        ...draft,
        id,
        slug: slugify(draft.slug),
        tags: normalizeTags(draft.tags),
        keywords: keywordsFrom(draft.title, draft.summary, draft.tags),
        readingTime: readingTime(draft.content),
      }
      saveAdminArticle(payload)
        .then(() => setSaveState('saved'))
        .catch(() => setSaveState('error'))
    }, 1200)
    return () => clearTimeout(timer)
  }, [draft, id])
  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({
      ...d,
      [key]: value,
      ...(key === 'title' && !id && !d.slug ? { slug: slugify(String(value)) } : {}),
    }))
  const persist = async (status = draft.status, redirect = true) => {
    if (!draft.title.trim() || !draft.slug.trim()) {
      setError('Título y slug son obligatorios.')
      return
    }
    setSaveState('saving')
    setError('')
    try {
      const payload = {
        ...draft,
        id: draft.id || id || ownerId,
        status,
        slug: slugify(draft.slug),
        tags: normalizeTags(draft.tags),
        keywords: keywordsFrom(draft.title, draft.summary, draft.tags),
        readingTime: readingTime(draft.content),
      }
      const result = await saveAdminArticle(payload)
      setSaveState('saved')
      setDraft((d) => ({ ...d, id: result.id, slug: result.slug, status }))
      if (!id && redirect) navigate(`/admin/articles/${result.id}/edit`, { replace: true })
    } catch {
      setSaveState('error')
      setError('No pudimos guardar el artículo.')
    }
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    void persist(draft.status)
  }
  if (loading) return <Spinner label="Cargando editor" />
  return (
    <>
      <div className="admin-title">
        <div>
          <p>Contenido</p>
          <h1>{id ? 'Editar artículo' : 'Nuevo artículo'}</h1>
        </div>
        <span className={`save-state ${saveState}`}>
          {saveState === 'saving'
            ? 'Guardando…'
            : saveState === 'saved'
              ? 'Guardado'
              : saveState === 'error'
                ? 'Error al guardar'
                : 'Sin cambios'}
        </span>
      </div>
      {error && <ErrorState message={error} />}
      <form className="editor" onSubmit={submit}>
        <div className="editor-main">
          <label>
            Título
            <input
              className="title-input"
              value={draft.title}
              onChange={(e) => update('title', e.target.value)}
              required
            />
          </label>
          <label>
            Slug
            <div className="slug-field">
              <span>/articulo/</span>
              <input value={draft.slug} onChange={(e) => update('slug', e.target.value)} required />
            </div>
            <small>
              Después de publicar no cambia automáticamente. Puedes editarlo manualmente.
            </small>
          </label>
          <label>
            Resumen
            <textarea
              rows={3}
              maxLength={320}
              value={draft.summary}
              onChange={(e) => update('summary', e.target.value)}
              required
            />
          </label>
          <label>
            Contenido Markdown
            <textarea
              className="markdown-editor"
              rows={22}
              value={draft.content}
              onChange={(e) => update('content', e.target.value)}
              required
              placeholder="# Escribe el artículo&#10;&#10;Comienza aquí…"
            />
          </label>
          <div className="editor-pair">
            <label>
              SEO title
              <input
                maxLength={70}
                value={draft.seoTitle || ''}
                onChange={(e) => update('seoTitle', e.target.value)}
              />
            </label>
            <label>
              SEO description
              <textarea
                rows={3}
                maxLength={160}
                value={draft.seoDescription || ''}
                onChange={(e) => update('seoDescription', e.target.value)}
              />
            </label>
          </div>
        </div>
        <aside className="editor-side">
          <section>
            <h2>Publicación</h2>
            <label>
              Estado
              <select
                value={draft.status}
                onChange={(e) => update('status', e.target.value as ArticleStatus)}
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(e) => update('featured', e.target.checked)}
              />{' '}
              Artículo destacado
            </label>
            <button className="button full" type="submit">
              {draft.status === 'published' ? 'Actualizar publicación' : 'Guardar borrador'}
            </button>
            {draft.id && (
              <Link className="button secondary full" to={`/admin/articles/${draft.id}/preview`}>
                Vista previa
              </Link>
            )}
            <button
              className="text-button full"
              type="button"
              onClick={() => void persist(draft.status === 'published' ? 'draft' : 'published')}
            >
              {draft.status === 'published' ? 'Pasar a borrador' : 'Publicar ahora'}
            </button>
          </section>
          <section>
            <h2>Clasificación</h2>
            <label>
              Categoría
              <select
                value={draft.category}
                onChange={(e) => update('category', e.target.value as CategorySlug)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Etiquetas
              <input
                value={draft.tags.join(', ')}
                onChange={(e) => update('tags', e.target.value.split(','))}
                placeholder="comunidad, análisis"
              />
            </label>
            <label>
              Autor
              <input
                value={draft.authorName}
                onChange={(e) => update('authorName', e.target.value)}
                required
              />
            </label>
          </section>
          <section>
            <h2>Portada</h2>
            <ImageUploader
              value={draft.coverImage}
              alt={draft.coverImageAlt}
              area="articles"
              ownerId={ownerId}
              onChange={(url) => update('coverImage', url)}
            />
            <label>
              Texto alternativo
              <input
                value={draft.coverImageAlt}
                onChange={(e) => update('coverImageAlt', e.target.value)}
                required={Boolean(draft.coverImage)}
              />
            </label>
          </section>
          <section>
            <h2>Imagen en contenido</h2>
            <label>
              Texto alternativo
              <input
                value={contentImageAlt}
                onChange={(e) => setContentImageAlt(e.target.value)}
                placeholder="Describe la imagen"
              />
            </label>
            <ImageUploader
              value=""
              alt={contentImageAlt}
              area="articles"
              ownerId={ownerId}
              kind="content"
              onChange={(url) => {
                update(
                  'content',
                  `${draft.content}\n\n![${contentImageAlt || 'Imagen del artículo'}](${url})\n`,
                )
                setContentImageAlt('')
              }}
            />
          </section>
          <Notice>Tiempo estimado: {readingTime(draft.content)} min.</Notice>
        </aside>
      </form>
    </>
  )
}
