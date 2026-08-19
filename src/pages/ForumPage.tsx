import { MessageCircle, PenLine, Send, ShieldCheck, UsersRound } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useAuth } from '../app/AuthProvider'
import { DEMO_FORUM_POSTS, DEMO_FORUM_REPLIES } from '../data/forumDemo'
import {
  createForumPost,
  createForumReply,
  getForumPosts,
  getForumReplies,
} from '../services/forum'
import { getProfile } from '../services/auth'
import type { ForumPost, ForumReply, ForumTopic } from '../types'
import { toDate } from '../utils/date'

const TOPICS: Array<{ value: ForumTopic; label: string }> = [
  { value: 'comunidad', label: 'Comunidad' },
  { value: 'pais', label: 'País' },
  { value: 'educacion', label: 'Educación' },
  { value: 'juventud', label: 'Juventud' },
  { value: 'accesibilidad', label: 'Accesibilidad' },
]

function readableDate(value: ForumPost['createdAt']) {
  const date = toDate(value)
  return date
    ? new Intl.DateTimeFormat('es-DO', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
    : 'Ahora'
}

function ForumThread({ post, authorName }: { post: ForumPost; authorName: string }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [replies, setReplies] = useState<ForumReply[]>([])
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const demoReplies = DEMO_FORUM_REPLIES[post.id]

  const openConversation = async () => {
    const next = !open
    setOpen(next)
    if (!next || replies.length) return
    if (demoReplies) {
      setReplies(demoReplies)
      return
    }
    setLoading(true)
    try {
      setReplies(await getForumReplies(post.id))
    } catch {
      setError('No pudimos cargar las respuestas.')
    } finally {
      setLoading(false)
    }
  }

  const submitReply = async (event: FormEvent) => {
    event.preventDefault()
    if (!user || reply.trim().length < 2) return
    if (demoReplies) {
      setError('Las conversaciones de ejemplo no reciben respuestas. Crea un tema nuevo.')
      return
    }
    setSending(true)
    setError('')
    try {
      await createForumReply(post.id, {
        content: reply,
        authorId: user.uid,
        authorName,
      })
      setReply('')
      setReplies(await getForumReplies(post.id))
    } catch {
      setError('No pudimos publicar tu respuesta. Comprueba la conexión e inténtalo nuevamente.')
    } finally {
      setSending(false)
    }
  }

  return (
    <article className="forum-thread">
      <div className="forum-thread-head">
        <span className="forum-topic">
          {TOPICS.find((topic) => topic.value === post.topic)?.label || 'Conversación'}
        </span>
        <span>{readableDate(post.createdAt)}</span>
      </div>
      <h2>{post.title}</h2>
      <p className="forum-author">Por {post.authorName}</p>
      <p className="forum-body">{post.content}</p>
      <button className="forum-conversation-button" onClick={() => void openConversation()}>
        <MessageCircle aria-hidden="true" />
        {open ? 'Cerrar conversación' : 'Ver conversación'}
      </button>
      {open && (
        <div className="forum-replies">
          <h3>Respuestas</h3>
          {loading ? (
            <p>Cargando respuestas…</p>
          ) : replies.length ? (
            replies.map((item) => (
              <div className="forum-reply" key={item.id}>
                <div>
                  <strong>{item.authorName}</strong>
                  <span>{readableDate(item.createdAt)}</span>
                </div>
                <p>{item.content}</p>
              </div>
            ))
          ) : (
            <p className="forum-no-replies">Sé la primera persona en responder.</p>
          )}
          {user ? (
            <form className="forum-reply-form" onSubmit={submitReply}>
              <label htmlFor={`reply-${post.id}`}>Tu respuesta</label>
              <textarea
                id={`reply-${post.id}`}
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                minLength={2}
                maxLength={600}
                required
                placeholder="Aporta una idea respetuosa y concreta…"
              />
              <div>
                <span>{reply.length}/600</span>
                <button className="button small" disabled={sending}>
                  <Send aria-hidden="true" /> {sending ? 'Publicando…' : 'Responder'}
                </button>
              </div>
            </form>
          ) : (
            <p className="forum-login-note">
              <Link to="/login">Inicia sesión</Link> para participar en esta conversación.
            </p>
          )}
          {error && (
            <p className="forum-error" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </article>
  )
}

export function ForumPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [authorName, setAuthorName] = useState('Miembro de SumateRD')
  const [usingDemo, setUsingDemo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [topic, setTopic] = useState<ForumTopic>('comunidad')
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState('')

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getForumPosts()
      setPosts(result.length ? result : DEMO_FORUM_POSTS)
      setUsingDemo(result.length === 0)
    } catch {
      setPosts(DEMO_FORUM_POSTS)
      setUsingDemo(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPosts()
  }, [loadPosts])

  useEffect(() => {
    if (!user) return
    getProfile(user.uid)
      .then((profile) => setAuthorName(profile?.fullName || 'Miembro de SumateRD'))
      .catch(() => setAuthorName('Miembro de SumateRD'))
  }, [user])

  const submitPost = async (event: FormEvent) => {
    event.preventDefault()
    if (!user) return
    setPublishing(true)
    setMessage('')
    try {
      await createForumPost({ title, content, topic, authorId: user.uid, authorName })
      setTitle('')
      setContent('')
      setMessage('Tu conversación fue publicada.')
      await loadPosts()
    } catch {
      setMessage(
        'No pudimos publicar. Es posible que todavía falte desplegar las reglas del foro en Firebase.',
      )
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="forum-page">
      <Helmet>
        <title>Foro ciudadano — SumateRD</title>
        <meta
          name="description"
          content="Un espacio para compartir ideas y conversar con respeto sobre la República Dominicana."
        />
      </Helmet>
      <header className="forum-hero">
        <div className="container">
          <div>
            <p className="forum-kicker">Opinión ciudadana</p>
            <h1>Tu voz también construye país</h1>
            <p>
              Comparte ideas, escucha otras experiencias y participa en conversaciones que nos
              ayuden a encontrar soluciones.
            </p>
          </div>
          <UsersRound aria-hidden="true" />
        </div>
      </header>

      <div className="container forum-layout">
        <main className="forum-feed">
          <div className="forum-section-heading">
            <div>
              <span>Conversaciones recientes</span>
              <h2>La comunidad está hablando</h2>
            </div>
            <MessageCircle aria-hidden="true" />
          </div>
          {usingDemo && (
            <div className="demo-notice" role="status">
              <strong>Vista de demostración</strong>
              <span>Estos temas muestran cómo se verá el foro con participación real.</span>
            </div>
          )}
          {loading ? (
            <p className="forum-loading">Cargando conversaciones…</p>
          ) : (
            <div className="forum-thread-list">
              {posts.map((post) => (
                <ForumThread post={post} authorName={authorName} key={post.id} />
              ))}
            </div>
          )}
        </main>

        <aside className="forum-sidebar">
          <section className="forum-compose">
            <PenLine aria-hidden="true" />
            <h2>Abre una conversación</h2>
            {user ? (
              <form onSubmit={submitPost}>
                <label htmlFor="forum-topic">Tema</label>
                <select
                  id="forum-topic"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value as ForumTopic)}
                >
                  {TOPICS.map((item) => (
                    <option value={item.value} key={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <label htmlFor="forum-title">Título</label>
                <input
                  id="forum-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  minLength={5}
                  maxLength={100}
                  required
                  placeholder="¿De qué quieres hablar?"
                />
                <label htmlFor="forum-content">Tu opinión o propuesta</label>
                <textarea
                  id="forum-content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  minLength={10}
                  maxLength={1000}
                  required
                  placeholder="Explica tu idea con claridad…"
                />
                <span className="forum-counter">{content.length}/1000</span>
                <button className="button full" disabled={publishing}>
                  {publishing ? 'Publicando…' : 'Publicar conversación'}
                </button>
              </form>
            ) : (
              <div className="forum-auth-callout">
                <p>Necesitas una cuenta para publicar o responder.</p>
                <Link className="button full" to="/login">
                  Iniciar sesión
                </Link>
                <Link className="forum-register-link" to="/registro">
                  Crear una cuenta
                </Link>
              </div>
            )}
            {message && (
              <p className="forum-form-message" role="status">
                {message}
              </p>
            )}
          </section>
          <section className="forum-guidelines">
            <ShieldCheck aria-hidden="true" />
            <div>
              <h2>Convivencia</h2>
              <p>
                Debate las ideas con respeto. No publiques cédulas, teléfonos, direcciones ni otros
                datos personales.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
