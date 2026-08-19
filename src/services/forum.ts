import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/client'
import type { ForumPost, ForumReply, ForumTopic } from '../types'

export async function getForumPosts() {
  const snapshot = await getDocs(
    query(
      collection(db, 'forumPosts'),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      limit(30),
    ),
  )
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as ForumPost)
}

export async function createForumPost(input: {
  title: string
  content: string
  topic: ForumTopic
  authorId: string
  authorName: string
}) {
  return addDoc(collection(db, 'forumPosts'), {
    title: input.title.trim(),
    content: input.content.trim(),
    topic: input.topic,
    authorId: input.authorId,
    authorName: input.authorName,
    status: 'published',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function getForumReplies(postId: string) {
  const snapshot = await getDocs(
    query(
      collection(db, 'forumPosts', postId, 'forumReplies'),
      where('status', '==', 'published'),
      orderBy('createdAt', 'asc'),
      limit(100),
    ),
  )
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as ForumReply)
}

export async function createForumReply(
  postId: string,
  input: { content: string; authorId: string; authorName: string },
) {
  return addDoc(collection(db, 'forumPosts', postId, 'forumReplies'), {
    content: input.content.trim(),
    authorId: input.authorId,
    authorName: input.authorName,
    status: 'published',
    createdAt: serverTimestamp(),
  })
}
