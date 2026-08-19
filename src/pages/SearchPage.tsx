import { Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { ArticleCard } from '../components/ArticleParts'
import { EmptyState, ErrorState, Spinner } from '../components/Ui'
import { searchDemoArticles } from '../data/demoContent'
import { isPublicCategory } from '../lib/constants'
import { searchArticles } from '../services/articles'
import type { Article } from '../types'
export function SearchPage() {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<Article[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (term.trim().length < 3) {
      setError('Escribe al menos 3 caracteres.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const remoteResults = (await searchArticles(term)).filter((article) =>
        isPublicCategory(article.category),
      )
      setResults(remoteResults.length ? remoteResults : searchDemoArticles(term))
    } catch {
      setResults(searchDemoArticles(term))
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="container page">
      <Helmet>
        <title>Buscar — SumateRD</title>
      </Helmet>
      <header className="page-title">
        <p>Archivo</p>
        <h1>Buscar en SumateRD</h1>
        <span>Busca por palabras clave, temas o categorías.</span>
      </header>
      <form className="search-form" onSubmit={submit}>
        <label className="sr-only" htmlFor="search">
          Buscar
        </label>
        <input
          id="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Ej.: comunidad, educación, cultura"
        />
        <button className="button">
          <Search /> Buscar
        </button>
      </form>
      {error && <ErrorState message={error} />}
      {loading ? (
        <Spinner label="Buscando" />
      ) : (
        results &&
        (results.length ? (
          <div className="article-grid">
            {results.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin resultados"
            message="Prueba con otra palabra o revisa las secciones."
          />
        ))
      )}
    </div>
  )
}
