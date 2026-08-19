import {
  collection,
  documentId,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../firebase/client'
import type { Article, ArticleStatus, CategorySlug } from '../types'

const fromDoc = (snap: DocumentSnapshot) => ({ id: snap.id, ...snap.data() }) as Article

export async function getPublishedArticles(
  options: {
    category?: CategorySlug
    featured?: boolean
    pageSize?: number
    cursor?: DocumentSnapshot
  } = {},
) {
  const constraints: any[] = [where('status', '==', 'published')]
  if (options.category) constraints.push(where('category', '==', options.category))
  if (options.featured !== undefined) constraints.push(where('featured', '==', options.featured))
  constraints.push(orderBy('publishedAt', 'desc'), limit(options.pageSize || 6))
  if (options.cursor) constraints.push(startAfter(options.cursor))
  const snap = await getDocs(query(collection(db, 'articles'), ...constraints))
  return { articles: snap.docs.map(fromDoc), cursor: snap.docs.at(-1) }
}

export async function getArticleBySlug(slug: string) {
  const snap = await getDocs(
    query(
      collection(db, 'articles'),
      where('slug', '==', slug),
      where('status', '==', 'published'),
      limit(1),
    ),
  )
  return snap.empty ? null : fromDoc(snap.docs[0])
}

export async function getArticleById(id: string) {
  const call = httpsCallable<{ action: string; id: string }, { article: Article | null }>(
    functions,
    'adminArticles',
  )
  return (await call({ action: 'get', id })).data.article
}

export async function getRelated(article: Article) {
  const snap = await getDocs(
    query(
      collection(db, 'articles'),
      where('status', '==', 'published'),
      where('category', '==', article.category),
      orderBy('publishedAt', 'desc'),
      limit(4),
    ),
  )
  return snap.docs
    .map(fromDoc)
    .filter((item) => item.id !== article.id)
    .slice(0, 3)
}

export async function searchArticles(term: string) {
  const keyword = term
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  if (keyword.length < 3) return []
  const snap = await getDocs(
    query(
      collection(db, 'articles'),
      where('status', '==', 'published'),
      where('keywords', 'array-contains', keyword),
      orderBy('publishedAt', 'desc'),
      limit(20),
    ),
  )
  return snap.docs.map(fromDoc)
}

export async function getAdminArticles(status?: ArticleStatus) {
  const call = httpsCallable<{ action: string; status?: string }, { articles: Article[] }>(
    functions,
    'adminArticles',
  )
  return (await call({ action: 'list', status })).data.articles
}

export async function saveAdminArticle(article: Partial<Article>) {
  const call = httpsCallable<
    { action: string; article: Partial<Article> },
    { id: string; slug: string }
  >(functions, 'adminArticles')
  return (await call({ action: 'save', article })).data
}

export async function deleteAdminArticle(id: string) {
  const call = httpsCallable(functions, 'adminArticles')
  await call({ action: 'delete', id })
}

export async function getDashboardCounts() {
  const call = httpsCallable<
    Record<string, never>,
    {
      total: number
      published: number
      drafts: number
      panels: number
      users: number
      forumPosts: number
      changeInterests: number
    }
  >(functions, 'adminStats')
  return (await call({})).data
}

export async function getArticlesByIds(ids: string[]) {
  if (!ids.length) return []
  const snap = await getDocs(
    query(collection(db, 'articles'), where(documentId(), 'in', ids.slice(0, 10))),
  )
  return snap.docs.map(fromDoc)
}
