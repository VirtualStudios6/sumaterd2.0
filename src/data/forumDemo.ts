import type { ForumPost, ForumReply } from '../types'

export const DEMO_FORUM_POSTS: ForumPost[] = [
  {
    id: 'demo-foro-comunidad',
    title: '¿Qué cambio pequeño mejoraría tu comunidad?',
    content:
      'En mi sector podríamos comenzar recuperando el parque y creando un calendario comunitario para cuidarlo entre todos. ¿Qué iniciativa sencilla funcionaría en el tuyo?',
    topic: 'comunidad',
    authorId: 'demo-ana',
    authorName: 'Ana M.',
    status: 'published',
    createdAt: '2026-08-18T15:00:00.000Z',
    updatedAt: '2026-08-18T15:00:00.000Z',
  },
  {
    id: 'demo-foro-jovenes',
    title: 'Ideas para que más jóvenes participen',
    content:
      'Sería bueno conectar estudiantes con proyectos reales de sus municipios: cultura, tecnología, deporte y apoyo escolar. Así podrían aportar mientras adquieren experiencia.',
    topic: 'juventud',
    authorId: 'demo-luis',
    authorName: 'Luis R.',
    status: 'published',
    createdAt: '2026-08-17T17:20:00.000Z',
    updatedAt: '2026-08-17T17:20:00.000Z',
  },
  {
    id: 'demo-foro-accesibilidad',
    title: '¿Cómo hacemos más accesibles los espacios públicos?',
    content:
      'Podríamos identificar junto a personas con discapacidad las aceras, cruces y edificios más difíciles de utilizar, y publicar un mapa de prioridades para darles seguimiento.',
    topic: 'accesibilidad',
    authorId: 'demo-maria',
    authorName: 'María C.',
    status: 'published',
    createdAt: '2026-08-16T13:10:00.000Z',
    updatedAt: '2026-08-16T13:10:00.000Z',
  },
]

export const DEMO_FORUM_REPLIES: Record<string, ForumReply[]> = {
  'demo-foro-comunidad': [
    {
      id: 'demo-reply-1',
      content:
        'En mi comunidad comenzaría con iluminación en las calles cercanas a la escuela y una jornada mensual de limpieza.',
      authorId: 'demo-carlos',
      authorName: 'Carlos P.',
      status: 'published',
      createdAt: '2026-08-18T18:00:00.000Z',
    },
  ],
  'demo-foro-jovenes': [
    {
      id: 'demo-reply-2',
      content: 'También ayudaría que los proyectos publiquen oportunidades cortas y muy concretas.',
      authorId: 'demo-elena',
      authorName: 'Elena S.',
      status: 'published',
      createdAt: '2026-08-17T19:00:00.000Z',
    },
  ],
  'demo-foro-accesibilidad': [],
}
