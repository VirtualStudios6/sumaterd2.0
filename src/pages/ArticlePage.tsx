import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router-dom'
import {
  ArticleCard,
  ArticleMeta,
  CategoryBadge,
  MarkdownContent,
  ShareButtons,
} from '../components/ArticleParts'
import { EmptyState, ErrorState, Spinner } from '../components/Ui'
import { SITE_URL } from '../lib/constants'
import { isPublicCategory } from '../lib/constants'
import { getArticleBySlug, getRelated } from '../services/articles'
import type { Article } from '../types'
import { toDate } from '../utils/date'

export function ArticlePage() {
  const { slug = '' } = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [related, setRelated] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    setLoading(true)
    setError('')
    getArticleBySlug(slug)
      .then(async (a) => {
        const selected = a && isPublicCategory(a.category) ? a : null
        setArticle(selected)
        if (!selected) return
        try {
          setRelated(await getRelated(selected))
        } catch {
          setRelated([])
        }
      })
      .catch(() => {
        setArticle(null)
        setRelated([])
        setError('No pudimos cargar este artículo. Comprueba la conexión e inténtalo de nuevo.')
      })
      .finally(() => setLoading(false))
  }, [slug])
  if (loading)
    return (
      <div className="container page">
        <Spinner label="Cargando artículo" />
      </div>
    )
  if (error)
    return (
      <div className="container page">
        <ErrorState message={error} />
      </div>
    )
  if (!article)
    return (
      <div className="container page">
        <EmptyState
          title="Este artículo no está disponible"
          message="Puede que haya cambiado de dirección o ya no esté publicado."
        />
      </div>
    )
  const url = `${SITE_URL}/articulo/${article.slug}`
  const image = article.coverImage || `${SITE_URL}/brand/logo.png`
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary,
    image: [image],
    datePublished: toDate(article.publishedAt)?.toISOString(),
    dateModified: toDate(article.updatedAt)?.toISOString(),
    author: { '@type': 'Person', name: article.authorName },
    publisher: { '@type': 'Organization', name: 'SumateRD' },
  }
  return (
    <article className="article-page">
      <Helmet>
        <title>{article.seoTitle || article.title} — SumateRD</title>
        <meta name="description" content={article.seoDescription || article.summary} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.seoTitle || article.title} />
        <meta property="og:description" content={article.seoDescription || article.summary} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={url} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>
      <header className="article-header container narrow">
        <CategoryBadge category={article.category} />
        <h1>{article.title}</h1>
        <p className="dek">{article.summary}</p>
        <ArticleMeta article={article} />
      </header>
      {article.coverImage && (
        <figure className="article-cover container">
          <img src={article.coverImage} alt={article.coverImageAlt} width="1500" height="850" />
        </figure>
      )}
      <div className="container narrow">
        <MarkdownContent content={article.content} />
        <div className="tags">
          {article.tags.map((t) => (
            <span key={t}>#{t}</span>
          ))}
        </div>
        <ShareButtons title={article.title} url={url} />
      </div>
      {related.length > 0 && (
        <section className="container related">
          <div className="section-heading">
            <h2>También te puede interesar</h2>
          </div>
          <div className="article-grid three">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
