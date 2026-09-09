import { Copy, Facebook, Share2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Link } from 'react-router-dom'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import type { Article } from '../types'
import { formatDate } from '../utils/date'

export function CategoryBadge({ category }: { category: string }) {
  return (
    <Link className="category" to={`/categoria/${category}`}>
      {category}
    </Link>
  )
}
export function ArticleMeta({ article }: { article: Article }) {
  return (
    <div className="meta">
      <span>Por {article.authorName}</span>
      <span>{formatDate(article.publishedAt || article.updatedAt)}</span>
      <span>{article.readingTime} min de lectura</span>
    </div>
  )
}
export function ArticleCard({ article, compact = false }: { article: Article; compact?: boolean }) {
  return (
    <article className={compact ? 'article-card compact' : 'article-card'}>
      {article.coverImage && (
        <Link to={`/articulo/${article.slug}`} className="card-image">
          <img
            src={article.coverImage}
            alt={article.coverImageAlt}
            loading="lazy"
            width="900"
            height="560"
          />
        </Link>
      )}
      <div>
        <CategoryBadge category={article.category} />
        <h3>
          <Link to={`/articulo/${article.slug}`}>{article.title}</Link>
        </h3>
        {!compact && <p>{article.summary}</p>}
        <ArticleMeta article={article} />
      </div>
    </article>
  )
}
export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]} skipHtml>
        {content}
      </ReactMarkdown>
    </div>
  )
}
export function ShareButtons({ title, url }: { title: string; url: string }) {
  const share = async () => {
    if (navigator.share) await navigator.share({ title, url })
    else await navigator.clipboard.writeText(url)
  }
  return (
    <div className="share" aria-label="Compartir artículo">
      <button onClick={() => void share()}>
        <Share2 /> Compartir
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noreferrer"
      >
        WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noreferrer"
      >
        <Facebook /> Facebook
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noreferrer"
      >
        X
      </a>
      <button onClick={() => void navigator.clipboard.writeText(url)}>
        <Copy /> Copiar enlace
      </button>
    </div>
  )
}
