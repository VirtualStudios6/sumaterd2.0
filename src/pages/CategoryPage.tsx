import type { DocumentSnapshot } from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router-dom'
import { ArticleCard } from '../components/ArticleParts'
import { EmptyState, ErrorState, Spinner } from '../components/Ui'
import { CATEGORIES, PAGE_SIZE } from '../lib/constants'
import { getPublishedArticles } from '../services/articles'
import type { Article, CategorySlug } from '../types'

export function CategoryPage() {
  const { slug = '' } = useParams()
  const category = CATEGORIES.find((c) => c.slug === slug)
  const [articles, setArticles] = useState<Article[]>([])
  const [cursor, setCursor] = useState<DocumentSnapshot>()
  const [history, setHistory] = useState<Array<DocumentSnapshot | undefined>>([undefined])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(
    (next: DocumentSnapshot | undefined, newHistory: Array<DocumentSnapshot | undefined>) => {
      if (!category) return
      setLoading(true)
      setError('')
      getPublishedArticles({
        category: category.slug as CategorySlug,
        pageSize: PAGE_SIZE,
        cursor: next,
      })
        .then((r) => {
          setArticles(r.articles)
          setCursor(r.cursor)
          setHistory(newHistory)
          window.scrollTo({ top: 0 })
        })
        .catch(() => {
          setArticles([])
          setCursor(undefined)
          setHistory([undefined])
          setError('No pudimos cargar esta sección. Comprueba la conexión e inténtalo de nuevo.')
        })
        .finally(() => setLoading(false))
    },
    [category],
  )
  useEffect(() => {
    setHistory([undefined])
    load(undefined, [undefined])
  }, [slug, load])
  if (!category)
    return (
      <div className="container page">
        <EmptyState title="Categoría no encontrada" message="Esta sección no existe." />
      </div>
    )
  return (
    <div className="container page">
      <Helmet>
        <title>{category.name} — SumateRD</title>
      </Helmet>
      <header className="page-title">
        <p>Sección</p>
        <h1>{category.name}</h1>
      </header>
      {error && <ErrorState message={error} />}
      {loading ? (
        <Spinner />
      ) : articles.length ? (
        <>
          <div className="article-grid">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
          <nav className="pagination" aria-label="Paginación">
            <button
              disabled={history.length <= 1}
              onClick={() => {
                const copy = [...history]
                copy.pop()
                load(copy.at(-1), copy)
              }}
            >
              ← Anterior
            </button>
            <span>Página {history.length}</span>
            <button
              disabled={articles.length < PAGE_SIZE || !cursor}
              onClick={() => load(cursor, [...history, cursor])}
            >
              Siguiente →
            </button>
          </nav>
        </>
      ) : (
        <EmptyState
          title="Sin publicaciones"
          message="Todavía no hay artículos publicados en esta sección."
        />
      )}
    </div>
  )
}
