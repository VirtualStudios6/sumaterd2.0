import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../firebase/client'
import type { Article, Author } from '../types'

const call = <T>(data: Record<string, unknown>) =>
  httpsCallable<Record<string, unknown>, T>(functions, 'adminAuthors')(data).then((r) => r.data)

export const listAdminAuthors = () =>
  call<{ authors: Author[] }>({ action: 'list' }).then((r) => r.authors)
export const getAdminAuthor = (id: string) =>
  call<{ author: Author | null }>({ action: 'get', id }).then((r) => r.author)
export const saveAdminAuthor = (author: Partial<Author>) =>
  call<{ id: string; slug: string }>({ action: 'save', author })
export const deleteAdminAuthor = (id: string) => call({ action: 'delete', id })

export async function getAuthorById(id: string) {
  const snap = await getDoc(doc(db, 'authors', id))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Author) : null
}

export async function getAuthorBySlug(slug: string) {
  const snap = await getDocs(query(collection(db, 'authors'), where('slug', '==', slug), limit(1)))
  return snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Author)
}

export async function getArticlesByAuthor(authorId: string) {
  const snap = await getDocs(
    query(
      collection(db, 'articles'),
      where('status', '==', 'published'),
      where('authorProfileId', '==', authorId),
      orderBy('publishedAt', 'desc'),
      limit(30),
    ),
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Article)
}
