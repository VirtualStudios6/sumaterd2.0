import type { Timestamp } from 'firebase/firestore'

export type ArticleStatus = 'draft' | 'published'
export type CategorySlug = 'opinion' | 'sociedad' | 'politica' | 'cambio' | 'actualidad'

export interface Article {
  id: string
  title: string
  slug: string
  summary: string
  content: string
  coverImage: string
  coverImageAlt: string
  authorId: string
  authorName: string
  category: CategorySlug
  tags: string[]
  keywords: string[]
  status: ArticleStatus
  featured: boolean
  createdAt: Timestamp | Date | string | null
  updatedAt: Timestamp | Date | string | null
  publishedAt: Timestamp | Date | string | null
  readingTime: number
  seoTitle?: string
  seoDescription?: string
}

export interface CarouselPanel {
  id: string
  title: string
  message: string
  imageUrl: string
  imageAlt: string
  buttonText?: string
  buttonUrl?: string
  active: boolean
  order: number
  createdAt?: Timestamp | Date | string | null
  updatedAt?: Timestamp | Date | string | null
}

export type ForumTopic = 'comunidad' | 'pais' | 'educacion' | 'juventud' | 'accesibilidad'

export interface ForumPost {
  id: string
  title: string
  content: string
  topic: ForumTopic
  authorId: string
  authorName: string
  status: 'published' | 'hidden'
  createdAt: Timestamp | Date | string | null
  updatedAt: Timestamp | Date | string | null
}

export interface ForumReply {
  id: string
  content: string
  authorId: string
  authorName: string
  status: 'published' | 'hidden'
  createdAt: Timestamp | Date | string | null
}

export interface UserProfile {
  uid: string
  fullName: string
  email: string
  cedulaMasked: string
  phone?: string
  province?: string
  municipality?: string
  bio?: string
  authProvider?: 'google.com' | 'password'
  isAdmin?: boolean
  status: 'active' | 'disabled'
  createdAt: Timestamp | Date | string | null
  updatedAt: Timestamp | Date | string | null
}

export interface SiteSettings {
  siteName: string
  tagline: string
  contactEmail: string
  aboutText?: string
  footerText?: string
}

export interface AdminUserRecord extends UserProfile {
  disabled?: boolean
}

export type ChangeInterestStatus = 'new' | 'contacted' | 'accepted' | 'closed'

export interface ChangeInterestRecord {
  id: string
  fullName: string
  email: string
  phone: string
  province: string
  municipality: string
  participation: ChangeParticipation
  status: ChangeInterestStatus
  reference: string
  formalAffiliation: boolean
  createdAt: Timestamp | Date | string | null
  updatedAt: Timestamp | Date | string | null
}

export interface AdminForumPost extends ForumPost {
  replyCount: number
}

export type ChangeParticipation = 'ideas' | 'volunteer' | 'organizer' | 'information'

export interface ChangeInterestInput {
  fullName: string
  email: string
  phone: string
  province: string
  municipality: string
  participation: ChangeParticipation
  adultConfirmed: boolean
  sensitiveDataConsent: boolean
  website?: string
}
