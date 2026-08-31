import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../app/SiteSettingsProvider'
import { ArticleCard, ArticleMeta, CategoryBadge } from '../components/ArticleParts'
import { EmptyState, ErrorState, Spinner } from '../components/Ui'
import { db } from '../firebase/client'
import { CATEGORIES, isPublicCategory } from '../lib/constants'
import { getPublishedArticles } from '../services/articles'
import type { Article, CarouselPanel } from '../types'

function HeroCarousel({ panels }: { panels: CarouselPanel[] }) {
  const [index, setIndex] = useState(0)
  const touch = useRef(0)
  useEffect(() => {
    if (panels.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setIndex((i) => (i + 1) % panels.length), 6500)
    return () => clearInterval(id)
  }, [panels.length])
  if (!panels.length) return null
  const panel = panels[index]
  return (
    <section
      className="hero"
      onTouchStart={(e) => {
        touch.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        const delta = e.changedTouches[0].clientX - touch.current
        if (Math.abs(delta) > 45)
          setIndex((i) => (i + (delta < 0 ? 1 : panels.length - 1)) % panels.length)
      }}
      aria-roledescription="carrusel"
      aria-label="Destacados"
    >
      <img
        src={panel.imageUrl}
        alt={panel.imageAlt}
        width="1600"
        height="720"
        fetchPriority="high"
      />
      <div className="hero-shade" />
      <div className="hero-context" aria-hidden="true">
        <span>SumateRD</span>
        <span>República Dominicana</span>
      </div>
      <div className="hero-content">
        <p className="eyebrow">
          <i /> En portada
        </p>
        <h1>{panel.title}</h1>
        <p>{panel.message}</p>
        {panel.buttonText && panel.buttonUrl && (
          <Link className="button light" to={panel.buttonUrl}>
            {panel.buttonText}
            <ArrowRight aria-hidden="true" />
          </Link>
        )}
      </div>
      {panels.length > 1 && (
        <>
          <button
            className="hero-arrow left"
            onClick={() => setIndex((i) => (i + panels.length - 1) % panels.length)}
            aria-label="Panel anterior"
          >
            <ChevronLeft />
          </button>
          <button
            className="hero-arrow right"
            onClick={() => setIndex((i) => (i + 1) % panels.length)}
            aria-label="Panel siguiente"
          >
            <ChevronRight />
          </button>
          <div className="dots">
            {panels.map((p, i) => (
              <button
                key={p.id}
                className={i === index ? 'active' : ''}
                onClick={() => setIndex(i)}
                aria-label={`Ir al panel ${i + 1}`}
                aria-current={i === index}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export function HomePage() {
  const settings = useSiteSettings()
  const [articles, setArticles] = useState<Article[]>([])
  const [panels, setPanels] = useState<CarouselPanel[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  useEffect(() => {
    Promise.allSettled([
      getPublishedArticles({ pageSize: 30 }),
      getDocs(
        query(collection(db, 'carousel'), where('active', '==', true), orderBy('order'), limit(8)),
      ),
    ])
      .then(([articleResult, panelResult]) => {
        if (articleResult.status === 'fulfilled') {
          setArticles(
            articleResult.value.articles
              .filter((article) => isPublicCategory(article.category))
              .slice(0, 10),
          )
        }
        if (panelResult.status === 'fulfilled') {
          setPanels(
            panelResult.value.docs.map(
              (item) => ({ id: item.id, ...item.data() }) as CarouselPanel,
            ),
          )
        }
        if (articleResult.status === 'rejected' || panelResult.status === 'rejected') {
          setLoadError('Parte de la portada no está disponible en este momento. Intenta recargar.')
        }
      })
      .finally(() => setLoading(false))
  }, [])
  const main = articles.find((a) => a.featured) || articles[0]
  const rest = articles.filter((a) => a.id !== main?.id)
  const categoryDetails: Record<string, string> = {
    opinion: 'Un foro abierto para conversar con respeto.',
    sociedad: 'Historias sobre comunidades y vida cotidiana.',
    cambio: 'Ideas y participación para construir una nueva opción.',
  }
  return (
    <>
      <Helmet>
        <title>SumateRD — República Dominicana en conversación</title>
      </Helmet>
      <div className="container home">
        {loading ? (
          <Spinner label="Cargando portada" />
        ) : (
          <>
            {loadError && <ErrorState message={loadError} />}
            <HeroCarousel panels={panels} />
            <section className="home-editorial-intro" aria-label="Propósito de SumateRD">
              <div>
                <p className="eyebrow">{settings.homeEyebrow}</p>
                <h2>{settings.homeTitle}</h2>
              </div>
              <p>{settings.homeDescription}</p>
            </section>
            {main ? (
              <section className="featured-block" aria-labelledby="destacado">
                <div className="home-section-label">
                  <span>Selección editorial</span>
                  <small>Lecturas destacadas</small>
                </div>
                <div className="lead-grid">
                  <article className="lead-story">
                    {main.coverImage && (
                      <Link to={`/articulo/${main.slug}`}>
                        <img
                          src={main.coverImage}
                          alt={main.coverImageAlt}
                          width="1100"
                          height="700"
                        />
                      </Link>
                    )}
                    <CategoryBadge category={main.category} />
                    <h2 id="destacado">
                      <Link to={`/articulo/${main.slug}`}>{main.title}</Link>
                    </h2>
                    <p>{main.summary}</p>
                    <ArticleMeta article={main} />
                  </article>
                  <div className="secondary-stories">
                    {rest.slice(0, 2).map((a) => (
                      <ArticleCard article={a} compact key={a.id} />
                    ))}
                  </div>
                </div>
              </section>
            ) : (
              <section className="home-empty-content">
                <EmptyState
                  title="Próximamente encontrarás nuevas publicaciones"
                  message="El equipo editorial está preparando el contenido de esta sección."
                />
              </section>
            )}
            {rest.length > 2 && (
              <section className="latest">
                <div className="section-heading">
                  <h2>Últimas publicaciones</h2>
                  <span>Lo más reciente</span>
                </div>
                <div className="article-list">
                  {rest.slice(2).map((a) => (
                    <ArticleCard article={a} key={a.id} />
                  ))}
                </div>
              </section>
            )}
            <section className="category-strip">
              <h2>Temas de conversación</h2>
              <div>
                {CATEGORIES.map((c) => (
                  <Link key={c.slug} to={`/categoria/${c.slug}`}>
                    <div>
                      <strong>{c.name}</strong>
                      <ArrowUpRight aria-hidden="true" />
                    </div>
                    <span>{categoryDetails[c.slug]}</span>
                  </Link>
                ))}
              </div>
            </section>
            <section className="home-participation-cta">
              <div>
                <p className="eyebrow">{settings.participationEyebrow}</p>
                <h2>{settings.participationTitle}</h2>
                <p>{settings.participationText}</p>
              </div>
              <div>
                <Link className="button light" to="/categoria/opinion">
                  <MessageCircle aria-hidden="true" /> Participar en el foro
                </Link>
                <Link className="button cta-outline" to="/categoria/cambio">
                  Conocer Proyecto Cambio <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  )
}
