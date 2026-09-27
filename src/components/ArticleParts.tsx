import { Check, Clock, Facebook, Link2, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Link } from 'react-router-dom'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import { CATEGORIES } from '../lib/constants'
import type { Article } from '../types'
import { formatDate } from '../utils/date'

export function categoryName(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug
}
export function CategoryBadge({ category }: { category: string }) {
  return (
    <Link className="category" to={`/categoria/${category}`}>
      {categoryName(category)}
    </Link>
  )
}
export function ArticleMeta({ article, compact = false }: { article: Article; compact?: boolean }) {
  return (
    <div className="meta">
      {!compact && <span className="meta-author">{article.authorName}</span>}
      <span>{formatDate(article.publishedAt || article.updatedAt)}</span>
      <span>
        <Clock aria-hidden="true" /> {article.readingTime} min
      </span>
    </div>
  )
}
export function ArticleCard({ article, compact = false }: { article: Article; compact?: boolean }) {
  return (
    <article
      className={`article-card${compact ? ' compact' : ''}${article.coverImage ? '' : ' text-only'}`}
    >
      {article.coverImage && (
        <Link to={`/articulo/${article.slug}`} className="card-image" tabIndex={-1}>
          <img
            src={article.coverImage}
            alt={article.coverImageAlt}
            loading="lazy"
            decoding="async"
            width="900"
            height="560"
          />
        </Link>
      )}
      <div className="card-body">
        <CategoryBadge category={article.category} />
        <h3>
          <Link to={`/articulo/${article.slug}`}>{article.title}</Link>
        </h3>
        {!compact && <p>{article.summary}</p>}
        <ArticleMeta article={article} compact={compact} />
      </div>
    </article>
  )
}
export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        skipHtml
        components={{
          img: ({ src, alt, title }) => (
            <figure>
              <img src={typeof src === 'string' ? src : ''} alt={alt || ''} loading="lazy" />
              {(title || alt) && <figcaption>{title || alt}</figcaption>}
            </figure>
          ),
          a: ({ href = '', children }) =>
            href.startsWith('/') && !href.startsWith('//') ? (
              <Link to={href}>{children}</Link>
            ) : /^https?:\/\//.test(href) ? (
              <a href={href} target="_blank" rel="noreferrer">
                {children}
              </a>
            ) : (
              <a href={href}>{children}</a>
            ),
          table: ({ children }) => (
            <div className="prose-table">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.04 2a9.9 9.9 0 0 0-8.5 14.98L2 22l5.17-1.5A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.07.9.91-2.99-.2-.31a8.2 8.2 0 1 1 6.86 3.73Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.96-.14.17-.29.19-.53.06a6.7 6.7 0 0 1-1.98-1.22 7.4 7.4 0 0 1-1.37-1.7c-.14-.25 0-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.44-.07-.12-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.57c.13.16 1.75 2.67 4.24 3.75.59.25 1.05.4 1.41.52.6.19 1.13.16 1.56.1.47-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z"
      />
    </svg>
  )
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.2h1.7L7.4 4.72H5.57L16.67 19.2Z"
      />
    </svg>
  )
}

export function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* el portapapeles puede no estar disponible */
    }
  }
  const share = async () => {
    if (!navigator.share) return copy()
    try {
      await navigator.share({ title, url })
    } catch {
      /* el usuario canceló */
    }
  }
  return (
    <div className="share" aria-label="Compartir artículo">
      <span className="share-label">Compartir</span>
      <div className="share-actions">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Compartir por WhatsApp"
        >
          <WhatsAppIcon />
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Compartir en Facebook"
        >
          <Facebook aria-hidden="true" />
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Compartir en X"
        >
          <XIcon />
        </a>
        <button onClick={() => void copy()} aria-label="Copiar enlace">
          {copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
        </button>
        <button className="share-native" onClick={() => void share()}>
          <Share2 aria-hidden="true" /> Compartir
        </button>
      </div>
      <span className="sr-only" role="status">
        {copied ? 'Enlace copiado' : ''}
      </span>
    </div>
  )
}

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className="reading-progress" aria-hidden="true">
      <span style={{ transform: `scaleX(${progress})` }} />
    </div>
  )
}
