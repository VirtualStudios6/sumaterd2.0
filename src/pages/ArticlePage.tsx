import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router-dom'
import {
  ArticleCard,
  ArticleMeta,
  CategoryBadge,
  MarkdownContent,
  ReadingProgress,
  ShareButtons,
} from '../components/ArticleParts'
import { AuthorBox } from '../components/AuthorParts'
import { EmptyState, ErrorState, Spinner } from '../components/Ui'
import { isPublicCategory, SITE_URL } from '../lib/constants'
import { getArticleBySlug, getRelated } from '../services/articles'
import { getAuthorById } from '../services/authors'
import type { Article, Author } from '../types'
import { toDate } from '../utils/date'

export function ArticlePage() {
  const { slug = '' } = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [related, setRelated] = useState<Article[]>([])
  const [author, setAuthor] = useState<Author | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    setLoading(true)
    setError('')
    getArticleBySlug(slug)
      .then(async (a) => {
        const selected = a && isPublicCategory(a.category) ? a : null
        setArticle(selected)
        setAuthor(null)
        if (!selected) return
        if (selected.authorProfileId)
          getAuthorById(selected.authorProfileId)
            .then(setAuthor)
            .catch(() => setAuthor(null))
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
  const image = article.coverImage || ''
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary,
    ...(image ? { image: [image] } : {}),
    datePublished: toDate(article.publishedAt)?.toISOString(),
    dateModified: toDate(article.updatedAt)?.toISOString(),
    author: {
      '@type': 'Person',
      name: article.authorName,
      ...(author ? { url: SITE_URL + '/autor/' + author.slug } : {}),
    },
    publisher: { '@type': 'Organization', name: 'SumateRD' },
  }
  return (
    <article className="article-page">
      <ReadingProgress />
      <Helmet>
        <title>{article.seoTitle || article.title} — SumateRD</title>
        <meta name="description" content={article.seoDescription || article.summary} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.seoTitle || article.title} />
        <meta property="og:description" content={article.seoDescription || article.summary} />
        {image && <meta property="og:image" content={image} />}
        {image && <meta name="twitter:image" content={image} />}
        <meta name="twitter:title" content={article.seoTitle || article.title} />
        <meta property="og:url" content={url} />
        <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
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
          <img
            src={article.coverImage}
            alt={article.coverImageAlt}
            width="1500"
            height="850"
            fetchPriority="high"
          />
        </figure>
      )}
      <div className="container narrow">
        <MarkdownContent content={article.content} />
        {article.tags.length > 0 && (
          <div className="tags">
            {article.tags.map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </div>
        )}
        <ShareButtons title={article.title} url={url} />
        {author && <AuthorBox author={author} />}
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
