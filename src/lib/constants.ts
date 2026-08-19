import type { CategorySlug } from '../types'

export const CATEGORIES: Array<{ name: string; slug: CategorySlug }> = [
  { name: 'Opinión', slug: 'opinion' },
  { name: 'Sociedad', slug: 'sociedad' },
  { name: 'Cambio', slug: 'cambio' },
]

export const PUBLIC_CATEGORY_SLUGS: CategorySlug[] = CATEGORIES.map((category) => category.slug)
export const isPublicCategory = (slug: CategorySlug) => PUBLIC_CATEGORY_SLUGS.includes(slug)

export const SITE_URL = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '')
export const PAGE_SIZE = 6
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
