import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router-dom'
import { ArticleCard } from '../components/ArticleParts'
import { AuthorAvatar, AuthorSocialLinks } from '../components/AuthorParts'
import { EmptyState, ErrorState, Spinner } from '../components/Ui'
import { isPublicCategory, SITE_URL } from '../lib/constants'
import { getArticlesByAuthor, getAuthorBySlug } from '../services/authors'
import type { Article, Author } from '../types'

export function AuthorPage() {
  const { slug = '' } = useParams()
  const [author, setAuthor] = useState<Author | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    setLoading(true)
    setError('')
    getAuthorBySlug(slug)
      .then(async (found) => {
        setAuthor(found)
        setArticles(
          found
            ? (await getArticlesByAuthor(found.id)).filter((a) => isPublicCategory(a.category))
            : [],
        )
      })
      .catch(() => setError('No pudimos cargar este perfil. Inténtalo de nuevo.'))
      .finally(() => setLoading(false))
  }, [slug])
  if (loading)
    return (
      <div className="container page">
        <Spinner label="Cargando autor" />
      </div>
    )
  if (error)
    return (
      <div className="container page">
        <ErrorState message={error} />
      </div>
    )
  if (!author)
    return (
      <div className="container page">
        <EmptyState title="Autor no encontrado" message="Este perfil no existe o fue retirado." />
      </div>
    )
  const count = articles.length
  return (
    <div className="container page author-page">
      <Helmet>
        <title>{author.name} — SumateRD</title>
        <meta name="description" content={author.bio || `Artículos de ${author.name}`} />
        <link rel="canonical" href={`${SITE_URL}/autor/${author.slug}`} />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={author.name} />
        {author.photoUrl && <meta property="og:image" content={author.photoUrl} />}
      </Helmet>
      <header className="author-hero">
        <AuthorAvatar author={author} size={112} />
        <div>
          <p className="eyebrow">Autor</p>
          <h1>{author.name}</h1>
          {author.role && <p className="author-role">{author.role}</p>}
          {author.bio && <p className="author-bio">{author.bio}</p>}
          <AuthorSocialLinks author={author} />
        </div>
      </header>
      <div className="section-heading">
        <h2>Artículos publicados</h2>
        <span>
          {count} {count === 1 ? 'artículo' : 'artículos'}
        </span>
      </div>
      {count ? (
        <div className="article-grid">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Todavía no hay artículos"
          message="Cuando publique, sus textos aparecerán aquí."
        />
      )}
    </div>
  )
}
