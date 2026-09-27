import {
  ArrowLeft,
  Bold,
  Check,
  Circle,
  ExternalLink,
  Eye,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MarkdownContent } from '../../components/ArticleParts'
import { ErrorState, Spinner } from '../../components/Ui'
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

function wordCount(markdown: string) {
  const text = markdown.replace(/[`#>*_[\]()!-]/g, ' ').trim()
  return text ? text.split(/\s+/).length : 0
}

export function ArticleEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const temporaryOwnerId = useRef(crypto.randomUUID()).current
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const [draft, setDraft] = useState<Draft>(blank)
  const [contentImageAlt, setContentImageAlt] = useState('')
  const [loading, setLoading] = useState(Boolean(id))
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [dirty, setDirty] = useState(false)
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
    if (!initialized.current || !id || draft.status !== 'draft') return
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
        .then(() => {
          setSaveState('saved')
          setDirty(false)
        })
        .catch(() => setSaveState('error'))
    }, 1200)
    return () => clearTimeout(timer)
  }, [draft, id])
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDirty(true)
    setDraft((d) => ({
      ...d,
      [key]: value,
      ...(key === 'title' && !id && (!d.slug || d.slug === slugify(d.title))
        ? { slug: slugify(String(value)) }
        : {}),
    }))
  }
  const persist = async (status = draft.status, redirect = true) => {
    if (!draft.title.trim() || !draft.slug.trim()) {
      setError('Título y slug son obligatorios.')
      return
    }
    if (status === 'published' && (!draft.summary.trim() || !draft.content.trim())) {
      setError('Para publicar completa el resumen y el contenido.')
      return
    }
    if (status === 'published' && draft.coverImage && !draft.coverImageAlt.trim()) {
      setError('Describe la imagen de portada (texto alternativo) antes de publicar.')
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
      setDirty(false)
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
  const persistRef = useRef(persist)
  persistRef.current = persist
  const onShortcut = useCallback((event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault()
      void persistRef.current(undefined, true)
    }
  }, [])
  useEffect(() => {
    window.addEventListener('keydown', onShortcut)
    return () => window.removeEventListener('keydown', onShortcut)
  }, [onShortcut])
  const insertMarkdown = (before: string, after = '', placeholder = 'texto', block = false) => {
    const element = contentRef.current
    const start = element?.selectionStart ?? draft.content.length
    const end = element?.selectionEnd ?? draft.content.length
    const selected = draft.content.slice(start, end) || placeholder
    const needsBreak = block && start > 0 && draft.content[start - 1] !== '\n'
    const prefix = `${needsBreak ? '\n\n' : ''}${before}`
    const next = `${draft.content.slice(0, start)}${prefix}${selected}${after}${draft.content.slice(end)}`
    update('content', next)
    if (!element) return
    requestAnimationFrame(() => {
      element.focus()
      element.setSelectionRange(start + prefix.length, start + prefix.length + selected.length)
    })
  }
  const checklist = [
    { label: 'Título', done: Boolean(draft.title.trim()) },
    { label: 'Resumen', done: Boolean(draft.summary.trim()) },
    { label: 'Contenido', done: Boolean(draft.content.trim()) },
    { label: 'Extensión de 150+ palabras', done: wordCount(draft.content) >= 150, optional: true },
    { label: 'Imagen de portada', done: Boolean(draft.coverImage), optional: true },
    {
      label: 'Texto alternativo de portada',
      done: !draft.coverImage || Boolean(draft.coverImageAlt.trim()),
    },
  ]
  const publishReady = Boolean(
    draft.title.trim() &&
    draft.slug.trim() &&
    draft.summary.trim() &&
    draft.content.trim() &&
    draft.category &&
    (!draft.coverImage || draft.coverImageAlt.trim()),
  )
  const seoTitle = draft.seoTitle || draft.title || 'Título del artículo'
  const seoDescription =
    draft.seoDescription || draft.summary || 'El resumen del artículo aparecerá aquí.'
  const words = wordCount(draft.content)
  const saveLabel =
    saveState === 'saving'
      ? 'Guardando…'
      : saveState === 'error'
        ? 'Error al guardar'
        : dirty
          ? draft.status === 'published'
            ? 'Cambios sin publicar'
            : 'Cambios pendientes'
          : saveState === 'saved'
            ? 'Guardado'
            : 'Sin cambios'
  if (loading) return <Spinner label="Cargando editor" />
  return (
    <>
      <div className="admin-title editor-title">
        <div>
          <Link className="admin-back" to="/admin/articles">
            <ArrowLeft aria-hidden="true" /> Artículos
          </Link>
          <h1>{id ? 'Editar artículo' : 'Nuevo artículo'}</h1>
        </div>
        <div className="editor-title-actions">
          <span
            className={`save-state ${dirty && saveState !== 'saving' ? 'dirty' : saveState}`}
            role="status"
          >
            <i aria-hidden="true" />
            {saveLabel}
          </span>
          {draft.status === 'published' && draft.slug && (
            <a
              className="button secondary small"
              href={`/articulo/${draft.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink aria-hidden="true" /> Ver en el sitio
            </a>
          )}
        </div>
      </div>
      {error && <ErrorState message={error} />}
      <form className="editor" onSubmit={submit}>
        <div className="editor-main">
          <label className="editor-title-field">
            <span className="sr-only">Título</span>
            <input
              className="title-input"
              value={draft.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Título del artículo"
              required
            />
          </label>
          <label>
            Resumen
            <textarea
              rows={3}
              maxLength={320}
              value={draft.summary}
              onChange={(e) => update('summary', e.target.value)}
              placeholder="Una o dos frases que expliquen de qué trata. Aparece bajo el título y en las tarjetas."
              required
            />
            <small className="field-meta">
              <span>Se muestra en portada, tarjetas y al compartir.</span>
              <span>{draft.summary.length}/320</span>
            </small>
          </label>
          <div className="editor-content-field">
            <div className="editor-content-head">
              <span>Contenido</span>
              <small>
                {words} palabras · {readingTime(draft.content)} min de lectura
              </small>
            </div>
            <div className="markdown-toolbar" role="toolbar" aria-label="Formato del artículo">
              <button
                type="button"
                onClick={() => insertMarkdown('## ', '\n', 'Subtítulo', true)}
                title="Subtítulo"
                aria-label="Subtítulo"
                disabled={showPreview}
              >
                <Heading2 />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('### ', '\n', 'Apartado', true)}
                title="Apartado"
                aria-label="Apartado"
                disabled={showPreview}
              >
                <Heading3 />
              </button>
              <span className="toolbar-sep" aria-hidden="true" />
              <button
                type="button"
                onClick={() => insertMarkdown('**', '**')}
                title="Negrita"
                aria-label="Negrita"
                disabled={showPreview}
              >
                <Bold />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('_', '_')}
                title="Cursiva"
                aria-label="Cursiva"
                disabled={showPreview}
              >
                <Italic />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('[', '](https://)', 'texto del enlace')}
                title="Enlace"
                aria-label="Enlace"
                disabled={showPreview}
              >
                <LinkIcon />
              </button>
              <span className="toolbar-sep" aria-hidden="true" />
              <button
                type="button"
                onClick={() => insertMarkdown('> ', '\n', 'Cita', true)}
                title="Cita"
                aria-label="Cita"
                disabled={showPreview}
              >
                <Quote />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('- ', '\n', 'Elemento', true)}
                title="Lista"
                aria-label="Lista"
                disabled={showPreview}
              >
                <List />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('1. ', '\n', 'Elemento', true)}
                title="Lista numerada"
                aria-label="Lista numerada"
                disabled={showPreview}
              >
                <ListOrdered />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('---\n', '', '', true)}
                title="Separador"
                aria-label="Separador"
                disabled={showPreview}
              >
                <Minus />
              </button>
              <button
                type="button"
                className={`toolbar-preview${showPreview ? ' active' : ''}`}
                onClick={() => setShowPreview((value) => !value)}
                aria-pressed={showPreview}
              >
                <Eye /> {showPreview ? 'Editar' : 'Vista previa'}
              </button>
            </div>
            {showPreview ? (
              <div className="editor-live-preview">
                {draft.content ? (
                  <MarkdownContent content={draft.content} />
                ) : (
                  <p>Comienza a escribir para ver la vista previa.</p>
                )}
              </div>
            ) : (
              <textarea
                ref={contentRef}
                className="markdown-editor"
                rows={22}
                value={draft.content}
                onChange={(e) => update('content', e.target.value)}
                aria-label="Contenido"
                required
                placeholder={
                  'Escribe aquí el artículo.\n\nDeja una línea en blanco entre párrafos. Usa la barra de herramientas para subtítulos, citas y listas.'
                }
              />
            )}
          </div>
          <details className="editor-seo">
            <summary>
              <span>SEO y redes sociales</span>
              <small>Cómo se verá en Google y al compartir</small>
            </summary>
            <div className="seo-preview" aria-hidden="true">
              <span className="seo-url">sumaterd.do › articulo › {draft.slug || 'slug'}</span>
              <strong>{seoTitle}</strong>
              <p>{seoDescription}</p>
            </div>
            <label>
              Slug (URL)
              <div className="slug-field">
                <span>/articulo/</span>
                <input
                  value={draft.slug}
                  onChange={(e) => update('slug', e.target.value)}
                  required
                />
              </div>
              <small>No cambies el slug de un artículo ya compartido: rompería los enlaces.</small>
            </label>
            <label>
              Título SEO
              <input
                maxLength={70}
                value={draft.seoTitle || ''}
                onChange={(e) => update('seoTitle', e.target.value)}
                placeholder={draft.title}
              />
              <small className="field-meta">
                <span>Opcional. Si lo dejas vacío se usa el título.</span>
                <span>{(draft.seoTitle || '').length}/70</span>
              </small>
            </label>
            <label>
              Descripción SEO
              <textarea
                rows={3}
                maxLength={160}
                value={draft.seoDescription || ''}
                onChange={(e) => update('seoDescription', e.target.value)}
                placeholder={draft.summary}
              />
              <small className="field-meta">
                <span>Opcional. Si la dejas vacía se usa el resumen.</span>
                <span>{(draft.seoDescription || '').length}/160</span>
              </small>
            </label>
          </details>
        </div>
        <aside className="editor-side">
          <section className="publish-panel">
            <div className="publish-panel-head">
              <h2>Publicación</h2>
              <span className={`status-pill ${draft.status}`}>
                {draft.status === 'published' ? 'Publicado' : 'Borrador'}
              </span>
            </div>
            <ul className="publish-checklist">
              {checklist.map((item) => (
                <li key={item.label} className={item.done ? 'done' : ''}>
                  {item.done ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />}
                  <span>{item.label}</span>
                  {item.optional && !item.done && <small>Recomendado</small>}
                </li>
              ))}
            </ul>
            {draft.status === 'draft' ? (
              <>
                <button
                  className="button publish full"
                  type="button"
                  onClick={() => void persist('published')}
                  disabled={!publishReady || saveState === 'saving'}
                >
                  Publicar ahora
                </button>
                <button
                  className="button secondary full"
                  type="submit"
                  disabled={saveState === 'saving'}
                >
                  Guardar borrador
                </button>
              </>
            ) : (
              <>
                <button
                  className="button full"
                  type="submit"
                  disabled={!publishReady || saveState === 'saving'}
                >
                  Actualizar publicación
                </button>
                <button
                  className="button ghost full"
                  type="button"
                  onClick={() => void persist('draft')}
                  disabled={saveState === 'saving'}
                >
                  Retirar y pasar a borrador
                </button>
              </>
            )}
            {draft.id && (
              <Link className="button ghost full" to={`/admin/articles/${draft.id}/preview`}>
                <Eye aria-hidden="true" /> Vista previa completa
              </Link>
            )}
            <label className="check featured-toggle">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(e) => update('featured', e.target.checked)}
              />
              <span>
                <strong>Destacar en portada</strong>
                <small>Aparece como historia principal.</small>
              </span>
            </label>
            <small className="shortcut-hint">
              Atajo: <kbd>Ctrl</kbd> + <kbd>S</kbd> para guardar
            </small>
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
            {draft.coverImage && (
              <label>
                Texto alternativo
                <input
                  value={draft.coverImageAlt}
                  onChange={(e) => update('coverImageAlt', e.target.value)}
                  placeholder="Describe la imagen para lectores con discapacidad visual"
                  required
                />
              </label>
            )}
            <small className="side-hint">Recomendado: horizontal, 1600 × 900 px.</small>
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
              <small>Separadas por comas.</small>
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
            <h2>Imagen en el contenido</h2>
            <label>
              Descripción / pie de foto
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
                setShowPreview(false)
                insertMarkdown(`![${contentImageAlt || 'Imagen del artículo'}](`, ')\n', url, true)
                setContentImageAlt('')
              }}
            />
            <small className="side-hint">Se inserta donde esté el cursor en el texto.</small>
          </section>
        </aside>
      </form>
    </>
  )
}
