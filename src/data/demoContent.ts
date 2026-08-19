import type { Article, CarouselPanel, CategorySlug } from '../types'

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=82`

const ALL_DEMO_ARTICLES: Article[] = [
  {
    id: 'demo-comunidades',
    title: 'Comunidades que transforman espacios olvidados en puntos de encuentro',
    slug: 'comunidades-transforman-espacios',
    summary:
      'Vecinos, jóvenes y organizaciones imaginan nuevas formas de recuperar sus barrios y fortalecer la convivencia.',
    content: `## Un espacio para volver a encontrarnos

Cuando una comunidad se organiza, un lugar que parecía perdido puede convertirse en una biblioteca, un pequeño parque o un punto de reunión. El primer paso no siempre es construir: muchas veces consiste en escuchar qué necesita cada persona.

## Ideas que nacen cerca

Los proyectos más útiles suelen comenzar con una conversación abierta entre residentes. Mapear necesidades, repartir responsabilidades y publicar los avances ayuda a que más personas se sientan parte del proceso.

> Este artículo es contenido de demostración creado para mostrar cómo se verá una publicación en SumateRD.

La meta es sencilla: recuperar la confianza y demostrar que los cambios cotidianos también pueden mejorar la vida colectiva.`,
    coverImage: image('photo-1494526585095-c41746248156'),
    coverImageAlt: 'Casas y áreas verdes de una comunidad',
    authorId: 'demo-redaccion',
    authorName: 'Redacción SumateRD',
    category: 'sociedad',
    tags: ['comunidad', 'barrios', 'participación'],
    keywords: ['comunidad', 'barrios', 'participacion', 'sociedad'],
    status: 'published',
    featured: true,
    createdAt: '2026-08-18T13:00:00.000Z',
    updatedAt: '2026-08-18T13:00:00.000Z',
    publishedAt: '2026-08-18T13:00:00.000Z',
    readingTime: 4,
  },
  {
    id: 'demo-escuchar',
    title: 'Escuchar antes de decidir: una práctica que fortalece la democracia',
    slug: 'escuchar-antes-de-decidir',
    summary:
      'La conversación pública mejora cuando las diferencias se convierten en preguntas y propuestas concretas.',
    content: `## La escucha también es participación

Una democracia saludable necesita espacios donde sea posible disentir sin dejar de reconocernos. Escuchar no significa renunciar a una posición: significa comprender mejor el problema antes de proponer una respuesta.

## Del debate a la propuesta

Explicar los datos, reconocer incertidumbres y resumir los puntos de acuerdo puede hacer que una conversación difícil avance. Esa disciplina permite evaluar las ideas por sus resultados y no solamente por quién las presenta.

*Contenido ilustrativo para la versión de demostración de SumateRD.*`,
    coverImage: image('photo-1521737711867-e3b97375f902'),
    coverImageAlt: 'Personas conversando alrededor de una mesa',
    authorId: 'demo-redaccion',
    authorName: 'Redacción SumateRD',
    category: 'opinion',
    tags: ['diálogo', 'democracia', 'opinión'],
    keywords: ['dialogo', 'democracia', 'opinion', 'escuchar'],
    status: 'published',
    featured: false,
    createdAt: '2026-08-17T15:30:00.000Z',
    updatedAt: '2026-08-17T15:30:00.000Z',
    publishedAt: '2026-08-17T15:30:00.000Z',
    readingTime: 3,
  },
  {
    id: 'demo-participacion',
    title: 'Participación ciudadana más allá de las elecciones',
    slug: 'participacion-mas-alla-elecciones',
    summary:
      'Dar seguimiento a las decisiones públicas y aportar soluciones locales también son formas de construir país.',
    content: `## Una tarea de todos los días

La participación no termina después de votar. Consultar información pública, acudir a encuentros comunitarios y dar seguimiento a compromisos permite mantener una relación más cercana entre ciudadanía e instituciones.

## Participar con información

Una propuesta gana fuerza cuando identifica un problema, presenta evidencia y define cómo medir los resultados. Ese método ayuda a pasar de la preocupación a una iniciativa que pueda discutirse y mejorarse.

*Contenido ilustrativo para la versión de demostración de SumateRD.*`,
    coverImage: image('photo-1517245386807-bb43f82c33c4'),
    coverImageAlt: 'Grupo de personas colaborando en una reunión',
    authorId: 'demo-redaccion',
    authorName: 'Redacción SumateRD',
    category: 'politica',
    tags: ['ciudadanía', 'participación', 'instituciones'],
    keywords: ['ciudadania', 'participacion', 'politica', 'instituciones'],
    status: 'published',
    featured: false,
    createdAt: '2026-08-16T14:00:00.000Z',
    updatedAt: '2026-08-16T14:00:00.000Z',
    publishedAt: '2026-08-16T14:00:00.000Z',
    readingTime: 4,
  },
  {
    id: 'demo-cambio',
    title: 'Cambio abre una conversación sobre el futuro del país',
    slug: 'cambio-conversacion-futuro-pais',
    summary:
      'Un punto de encuentro para compartir ideas, conocer el proyecto y participar en la construcción de una nueva propuesta.',
    content: `## Una invitación a proponer

Cambio es un espacio para quienes quieren conversar sobre el futuro de la República Dominicana y aportar ideas de forma respetuosa, transparente y organizada.

## Cómo participar

Las personas interesadas pueden conocer los principios del proyecto, enviar sus datos mediante el formulario de participación y elegir cómo desean colaborar. La inscripción mostrada en esta web expresa interés preliminar y no sustituye procesos oficiales.

*Contenido ilustrativo para la versión de demostración de SumateRD.*`,
    coverImage: image('photo-1529156069898-49953e39b3ac'),
    coverImageAlt: 'Personas reunidas al aire libre',
    authorId: 'demo-redaccion',
    authorName: 'Redacción SumateRD',
    category: 'cambio',
    tags: ['cambio', 'futuro', 'participación'],
    keywords: ['cambio', 'futuro', 'pais', 'participacion'],
    status: 'published',
    featured: false,
    createdAt: '2026-08-15T16:00:00.000Z',
    updatedAt: '2026-08-15T16:00:00.000Z',
    publishedAt: '2026-08-15T16:00:00.000Z',
    readingTime: 3,
  },
  {
    id: 'demo-movilidad',
    title: 'Movilidad y barrios: ideas para construir ciudades más humanas',
    slug: 'movilidad-barrios-ciudades-humanas',
    summary:
      'Aceras transitables, rutas conectadas y espacios seguros pueden cambiar la experiencia cotidiana de una ciudad.',
    content: `## La ciudad a escala humana

Moverse con seguridad y comodidad influye en el acceso al trabajo, la educación y los servicios. Observar una ruta desde la experiencia de niños, personas mayores y ciudadanos con discapacidad revela obstáculos que suelen pasar inadvertidos.

## Medir para mejorar

Identificar cruces difíciles, tiempos de traslado y puntos sin iluminación permite priorizar soluciones. Los cambios pequeños, cuando responden a datos y se mantienen en el tiempo, pueden producir una mejora visible.

*Contenido ilustrativo para la versión de demostración de SumateRD.*`,
    coverImage: image('photo-1477959858617-67f85cf4f1df'),
    coverImageAlt: 'Vista urbana con edificios y calles',
    authorId: 'demo-redaccion',
    authorName: 'Redacción SumateRD',
    category: 'actualidad',
    tags: ['ciudad', 'movilidad', 'accesibilidad'],
    keywords: ['ciudad', 'movilidad', 'actualidad', 'accesibilidad'],
    status: 'published',
    featured: false,
    createdAt: '2026-08-14T13:00:00.000Z',
    updatedAt: '2026-08-14T13:00:00.000Z',
    publishedAt: '2026-08-14T13:00:00.000Z',
    readingTime: 4,
  },
  {
    id: 'demo-jovenes',
    title: 'Jóvenes crean nuevas redes de colaboración comunitaria',
    slug: 'jovenes-redes-colaboracion',
    summary:
      'Iniciativas de mentoría, cultura y tecnología conectan talentos con necesidades concretas de sus comunidades.',
    content: `## Talento que se conecta

Una red de colaboración permite compartir conocimientos, encontrar mentores y convertir una buena idea en una actividad sostenible. La tecnología facilita el encuentro, pero el vínculo se fortalece con objetivos claros y trabajo constante.

## Aprender haciendo

Talleres, jornadas culturales y proyectos de servicio ofrecen experiencias que complementan la educación formal. También ayudan a que cada joven descubra de qué manera puede contribuir a su comunidad.

*Contenido ilustrativo para la versión de demostración de SumateRD.*`,
    coverImage: image('photo-1500530855697-b586d89ba3ee'),
    coverImageAlt: 'Jóvenes compartiendo en un espacio abierto',
    authorId: 'demo-redaccion',
    authorName: 'Redacción SumateRD',
    category: 'sociedad',
    tags: ['juventud', 'colaboración', 'comunidad'],
    keywords: ['jovenes', 'juventud', 'colaboracion', 'sociedad'],
    status: 'published',
    featured: false,
    createdAt: '2026-08-13T13:00:00.000Z',
    updatedAt: '2026-08-13T13:00:00.000Z',
    publishedAt: '2026-08-13T13:00:00.000Z',
    readingTime: 3,
  },
  {
    id: 'demo-transparencia',
    title: 'Transparencia local: acercar las decisiones a la gente',
    slug: 'transparencia-local-decisiones',
    summary:
      'Información clara, plazos visibles y canales de seguimiento ayudan a fortalecer la confianza pública.',
    content: `## Información que se puede entender

Publicar datos es importante, pero también lo es presentarlos de manera clara. Una persona debería poder conocer qué se decidió, por qué se decidió y cuándo podrá verificar el resultado.

## Confianza basada en seguimiento

Los tableros públicos, las reuniones periódicas y las respuestas documentadas permiten que los compromisos no se pierdan. La transparencia funciona mejor cuando forma parte del proceso desde el principio.

*Contenido ilustrativo para la versión de demostración de SumateRD.*`,
    coverImage: image('photo-1486406146926-c627a92ad1ab'),
    coverImageAlt: 'Edificios institucionales en una ciudad',
    authorId: 'demo-redaccion',
    authorName: 'Redacción SumateRD',
    category: 'politica',
    tags: ['transparencia', 'gestión', 'ciudadanía'],
    keywords: ['transparencia', 'gestion', 'politica', 'ciudadania'],
    status: 'published',
    featured: false,
    createdAt: '2026-08-12T13:00:00.000Z',
    updatedAt: '2026-08-12T13:00:00.000Z',
    publishedAt: '2026-08-12T13:00:00.000Z',
    readingTime: 4,
  },
  {
    id: 'demo-acciones',
    title: 'Pequeñas acciones que mejoran la vida en comunidad',
    slug: 'pequenas-acciones-comunidad',
    summary:
      'Organizar, cuidar y compartir información útil puede generar resultados visibles sin esperar grandes recursos.',
    content: `## Empezar por lo posible

Una comunidad puede avanzar cuando identifica una meta concreta y posible de medir. Recuperar un área, acompañar a estudiantes o crear un directorio de servicios son ejemplos de acciones que pueden comenzar con pocos recursos.

## Hacer que el esfuerzo permanezca

Documentar el proceso y repartir las tareas evita que todo dependa de una sola persona. Celebrar los resultados también ayuda a sumar nuevos participantes y sostener el proyecto.

*Contenido ilustrativo para la versión de demostración de SumateRD.*`,
    coverImage: image('photo-1495020689067-958852a7765e'),
    coverImageAlt: 'Mesa con materiales de trabajo y planificación',
    authorId: 'demo-redaccion',
    authorName: 'Redacción SumateRD',
    category: 'actualidad',
    tags: ['comunidad', 'iniciativas', 'actualidad'],
    keywords: ['comunidad', 'acciones', 'iniciativas', 'actualidad'],
    status: 'published',
    featured: false,
    createdAt: '2026-08-11T13:00:00.000Z',
    updatedAt: '2026-08-11T13:00:00.000Z',
    publishedAt: '2026-08-11T13:00:00.000Z',
    readingTime: 3,
  },
]

export const DEMO_ARTICLES = ALL_DEMO_ARTICLES.filter(
  (article) =>
    article.category === 'opinion' ||
    article.category === 'sociedad' ||
    article.category === 'cambio',
)

export const DEMO_PANELS: CarouselPanel[] = DEMO_ARTICLES.slice(0, 3).map((article, order) => ({
  id: `demo-panel-${order + 1}`,
  title: article.title,
  message: article.summary,
  imageUrl: article.coverImage,
  imageAlt: article.coverImageAlt,
  buttonText: 'Leer historia',
  buttonUrl: `/articulo/${article.slug}`,
  active: true,
  order,
}))

export function getDemoArticle(slug: string) {
  return DEMO_ARTICLES.find((article) => article.slug === slug) ?? null
}

export function getDemoArticlesByCategory(category: CategorySlug) {
  return DEMO_ARTICLES.filter((article) => article.category === category)
}

export function searchDemoArticles(term: string) {
  const normalized = term
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  return DEMO_ARTICLES.filter((article) =>
    [article.title, article.summary, article.category, ...article.tags, ...article.keywords]
      .join(' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .includes(normalized),
  )
}
