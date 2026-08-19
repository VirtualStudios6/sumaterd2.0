import { ChevronDown, ChevronUp, Eye, EyeOff, MessageSquareText, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ConfirmDialog, ErrorState, Notice, Spinner } from '../../components/Ui'
import { adminForum } from '../../services/admin'
import type { AdminForumPost, ForumReply } from '../../types'
import { formatDate } from '../../utils/date'

export function ForumAdminPage() {
  const [posts, setPosts] = useState<AdminForumPost[]>([])
  const [replies, setReplies] = useState<Record<string, ForumReply[]>>({})
  const [expanded, setExpanded] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [deleting, setDeleting] = useState<AdminForumPost | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      setPosts((await adminForum('list')).posts || [])
    } catch {
      setError('No pudimos cargar las conversaciones del foro.')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void load()
  }, [])

  const toggleReplies = async (postId: string) => {
    if (expanded === postId) return setExpanded('')
    setExpanded(postId)
    if (replies[postId]) return
    try {
      const loaded = (await adminForum('replies', { postId })).replies || []
      setReplies((current) => ({
        ...current,
        [postId]: loaded,
      }))
    } catch {
      setError('No pudimos cargar las respuestas.')
    }
  }

  const setPostStatus = async (post: AdminForumPost) => {
    try {
      await adminForum('setStatus', {
        postId: post.id,
        status: post.status === 'published' ? 'hidden' : 'published',
      })
      setMessage(post.status === 'published' ? 'Conversación ocultada.' : 'Conversación publicada.')
      await load()
    } catch {
      setError('No se pudo actualizar la conversación.')
    }
  }

  const moderateReply = async (postId: string, reply: ForumReply, remove = false) => {
    try {
      await adminForum(remove ? 'deleteReply' : 'setReplyStatus', {
        postId,
        replyId: reply.id,
        ...(!remove ? { status: reply.status === 'published' ? 'hidden' : 'published' } : {}),
      })
      const next = (await adminForum('replies', { postId })).replies || []
      setReplies((current) => ({ ...current, [postId]: next }))
      setMessage(remove ? 'Respuesta eliminada.' : 'Respuesta actualizada.')
    } catch {
      setError('No se pudo moderar la respuesta.')
    }
  }

  return (
    <>
      <div className="admin-title">
        <div>
          <p>Moderación</p>
          <h1>Foro ciudadano</h1>
        </div>
        <span className="admin-total">{posts.length} conversaciones</span>
      </div>
      {error && <ErrorState message={error} />}
      {message && <Notice>{message}</Notice>}
      {loading ? (
        <Spinner />
      ) : (
        <div className="admin-forum-list">
          {posts.map((post) => (
            <article key={post.id}>
              <div className="admin-forum-head">
                <span
                  className={`status-pill ${post.status === 'published' ? 'published' : 'draft'}`}
                >
                  {post.status === 'published' ? 'Visible' : 'Oculto'}
                </span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <h2>{post.title}</h2>
              <p className="admin-forum-by">
                {post.authorName} · {post.topic}
              </p>
              <p>{post.content}</p>
              <div className="admin-forum-actions">
                <button onClick={() => void toggleReplies(post.id)}>
                  <MessageSquareText /> {post.replyCount} respuestas
                  {expanded === post.id ? <ChevronUp /> : <ChevronDown />}
                </button>
                <button onClick={() => void setPostStatus(post)}>
                  {post.status === 'published' ? <EyeOff /> : <Eye />}
                  {post.status === 'published' ? 'Ocultar' : 'Publicar'}
                </button>
                <button className="danger-link" onClick={() => setDeleting(post)}>
                  <Trash2 /> Eliminar
                </button>
              </div>
              {expanded === post.id && (
                <div className="admin-replies">
                  {(replies[post.id] || []).map((reply) => (
                    <div key={reply.id}>
                      <p>
                        <strong>{reply.authorName}</strong> · {formatDate(reply.createdAt)}
                      </p>
                      <span>{reply.content}</span>
                      <div>
                        <button onClick={() => void moderateReply(post.id, reply)}>
                          {reply.status === 'published' ? 'Ocultar' : 'Publicar'}
                        </button>
                        <button onClick={() => void moderateReply(post.id, reply, true)}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                  {replies[post.id] && !replies[post.id].length && <p>No hay respuestas.</p>}
                </div>
              )}
            </article>
          ))}
          {!posts.length && (
            <p className="table-empty">El foro todavía no tiene conversaciones reales.</p>
          )}
        </div>
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="¿Eliminar la conversación completa?"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return
          adminForum('delete', { postId: deleting.id })
            .then(async () => {
              setDeleting(null)
              setMessage('Conversación y respuestas eliminadas.')
              await load()
            })
            .catch(() => setError('No se pudo eliminar la conversación.'))
        }}
      >
        También se eliminarán todas sus respuestas. Esta acción no se puede deshacer.
      </ConfirmDialog>
    </>
  )
}
