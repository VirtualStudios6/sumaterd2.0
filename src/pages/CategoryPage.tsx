import type { DocumentSnapshot } from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router-dom'
import { ArticleCard } from '../components/ArticleParts'
import { EmptyState, Spinner } from '../components/Ui'
import { getDemoArticlesByCategory } from '../data/demoContent'
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
  const [usingDemo, setUsingDemo] = useState(false)
  const load = useCallback(
    (next: DocumentSnapshot | undefined, newHistory: Array<DocumentSnapshot | undefined>) => {
      if (!category) return
      setLoading(true)
      setUsingDemo(false)
      getPublishedArticles({
        category: category.slug as CategorySlug,
        pageSize: PAGE_SIZE,
        cursor: next,
      })
        .then((r) => {
          const demoArticles = getDemoArticlesByCategory(category.slug)
          setArticles(r.articles.length ? r.articles : demoArticles)
          setCursor(r.articles.length ? r.cursor : undefined)
          setUsingDemo(r.articles.length === 0 && demoArticles.length > 0)
          setHistory(newHistory)
          window.scrollTo({ top: 0 })
        })
        .catch(() => {
          setArticles(getDemoArticlesByCategory(category.slug))
          setCursor(undefined)
          setHistory([undefined])
          setUsingDemo(true)
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
      {usingDemo && (
        <div className="demo-notice compact" role="status">
          <strong>Contenido de demostración</strong>
          <span>Estas publicaciones son ejemplos visuales.</span>
        </div>
      )}
      {loading ? (
        <Spinner />
      ) : articles.length ? (
        <>
          <div className="article-grid">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
          <nav className="pagination" aria-label="Paginación" hidden={usingDemo}>
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
