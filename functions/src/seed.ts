import { db, FieldValue } from './shared.js'

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error(
    'El seed solo se ejecuta contra Firestore Emulator. Define FIRESTORE_EMULATOR_HOST.',
  )
}

const categories = [
  ['opinion', 'Opinión'],
  ['sociedad', 'Sociedad'],
  ['cambio', 'Cambio'],
]
const topics = [
  ['La conversación pendiente sobre nuestros espacios públicos', 'sociedad'],
  ['Barrios que encuentran nuevas formas de organizarse', 'sociedad'],
  ['El valor de escuchar antes de tomar decisiones', 'opinion'],
  ['Ideas ciudadanas para transformar nuestras comunidades', 'cambio'],
  ['Participación ciudadana más allá de las elecciones', 'opinion'],
  ['La cultura de cuidar lo que compartimos', 'sociedad'],
  ['Una nueva forma de participar en el futuro del país', 'cambio'],
  ['Una mirada a la movilidad en Santo Domingo', 'sociedad'],
  ['Instituciones cercanas, ciudadanía más fuerte', 'opinion'],
  ['El país que contamos también construye el país', 'opinion'],
] as const
const images = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80',
]
const batch = db.batch()
categories.forEach(([slug, name], order) =>
  batch.set(db.doc(`categories/${slug}`), {
    slug,
    name,
    order,
    active: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }),
)
topics.forEach(([title, category], index) => {
  const id = `seed-article-${index + 1}`
  const slug = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  batch.set(db.doc(`articles/${id}`), {
    title,
    slug,
    summary:
      'Una lectura cercana a los cambios, preguntas y posibilidades que atraviesan la vida dominicana.',
    content: `## Mirar lo cotidiano\n\nLas conversaciones importantes también comienzan en escenas sencillas: una calle, una fila, una decisión comunitaria. Este artículo de desarrollo permite probar la experiencia editorial sin atribuir hechos a personas reales.\n\n> Una sociedad se entiende mejor cuando escucha todas sus voces.\n\n## Puntos para conversar\n\n- Cómo cambia nuestra experiencia común.\n- Qué pueden aportar las comunidades.\n- Cuáles preguntas necesitan seguimiento.\n\nEl contenido es ficticio y debe sustituirse por trabajo editorial antes de producción.`,
    coverImage: images[index % images.length],
    coverImageAlt: 'Paisaje urbano utilizado como imagen editorial de desarrollo',
    authorId: 'editorial',
    authorName: 'Redacción SumateRD',
    category,
    tags: [category, 'republica-dominicana'],
    keywords: [
      ...new Set(
        `${title} ${category} republica dominicana comunidad`
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((x) => x.length >= 3),
      ),
    ],
    status: 'published',
    featured: index === 0,
    readingTime: 2,
    seoTitle: title,
    seoDescription:
      'Análisis editorial de SumateRD sobre temas de conversación en República Dominicana.',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    publishedAt: new Date(Date.now() - index * 86400000),
  })
})
for (let index = 0; index < 3; index++)
  batch.set(db.doc(`carousel/seed-panel-${index + 1}`), {
    title: topics[index][0],
    message: 'Ideas y conversaciones para entender mejor la República Dominicana de hoy.',
    imageUrl: images[index],
    imageAlt: 'Imagen editorial de desarrollo',
    buttonText: 'Leer artículo',
    buttonUrl: `/articulo/${topics[index][0]
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}`,
    active: true,
    order: index,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
batch.set(db.doc('settings/public'), {
  public: true,
  siteName: 'SumateRD',
  tagline: 'República Dominicana en conversación',
  contactEmail: '',
  updatedAt: FieldValue.serverTimestamp(),
})
await batch.commit()
console.log('Seed completado: 3 categorías, 10 artículos y 3 paneles.')
