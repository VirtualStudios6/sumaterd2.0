import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArticleCard, ArticleMeta, CategoryBadge } from '../components/ArticleParts'
import { Spinner } from '../components/Ui'
import { DEMO_ARTICLES, DEMO_PANELS } from '../data/demoContent'
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
  const [articles, setArticles] = useState<Article[]>([])
  const [panels, setPanels] = useState<CarouselPanel[]>([])
  const [loading, setLoading] = useState(true)
  const [usingDemo, setUsingDemo] = useState(false)
  useEffect(() => {
    Promise.all([
      getPublishedArticles({ pageSize: 30 }),
      getDocs(
        query(collection(db, 'carousel'), where('active', '==', true), orderBy('order'), limit(8)),
      ),
    ])
      .then(([result, snap]) => {
        const visibleArticles = result.articles.filter((article) =>
          isPublicCategory(article.category),
        )
        const remotePanels = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CarouselPanel)
        const hasArticles = visibleArticles.length > 0
        const hasPanels = remotePanels.length > 0
        setArticles(hasArticles ? visibleArticles.slice(0, 10) : DEMO_ARTICLES)
        setPanels(hasPanels ? remotePanels : DEMO_PANELS)
        setUsingDemo(!hasArticles || !hasPanels)
      })
      .catch(() => {
        setArticles(DEMO_ARTICLES)
        setPanels(DEMO_PANELS)
        setUsingDemo(true)
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
            {usingDemo && (
              <div className="demo-notice" role="status">
                <strong>Vista de demostración</strong>
                <span>
                  Estos ejemplos muestran cómo lucirá la portada mientras se publica el contenido
                  real.
                </span>
              </div>
            )}
            <HeroCarousel panels={panels} />
            <section className="home-editorial-intro" aria-label="Propósito de SumateRD">
              <div>
                <p className="eyebrow">Un país en conversación</p>
                <h2>Información para comprender. Espacios para participar.</h2>
              </div>
              <p>
                SumateRD conecta ideas, historias y voces dominicanas en una experiencia clara,
                cercana y abierta a la ciudadanía.
              </p>
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
            ) : null}
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
                <p className="eyebrow">Tu voz cuenta</p>
                <h2>La conversación también comienza contigo.</h2>
                <p>Comparte una idea en el foro o conoce cómo participar en Proyecto Cambio.</p>
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
