import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'

let env: RulesTestEnvironment
beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'sumaterd-da931',
    firestore: {
      rules: readFileSync(resolve('firestore.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  })
})
beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore()
    await setDoc(doc(db, 'articles/published'), { status: 'published', title: 'Público' })
    await setDoc(doc(db, 'articles/draft'), { status: 'draft', title: 'Privado' })
    await setDoc(doc(db, 'users/alice'), {
      uid: 'alice',
      fullName: 'Alicia Pérez',
      email: 'a@example.com',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await setDoc(doc(db, 'users/bob'), {
      uid: 'bob',
      fullName: 'Bob Pérez',
      email: 'b@example.com',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await setDoc(doc(db, 'cedulaReservations/hash'), { uid: 'alice' })
    await setDoc(doc(db, 'changeInterests/hash'), { email: 'private@example.test' })
    await setDoc(doc(db, 'carousel/panel'), { active: true, title: 'Panel' })
  })
})
afterAll(async () => env.cleanup())

describe('reglas Firestore', () => {
  it('visitante lee publicado pero no borrador ni reservas', async () => {
    const db = env.unauthenticatedContext().firestore()
    await assertSucceeds(getDoc(doc(db, 'articles/published')))
    await assertFails(getDoc(doc(db, 'articles/draft')))
    await assertFails(getDoc(doc(db, 'cedulaReservations/hash')))
    await assertFails(getDoc(doc(db, 'changeInterests/hash')))
  })
  it('visitante no edita artículos ni carrusel', async () => {
    const db = env.unauthenticatedContext().firestore()
    await assertFails(updateDoc(doc(db, 'articles/published'), { title: 'Cambio' }))
    await assertFails(updateDoc(doc(db, 'carousel/panel'), { title: 'Cambio' }))
  })
  it('usuario lee y actualiza solo su perfil permitido', async () => {
    const db = env.authenticatedContext('alice').firestore()
    await assertSucceeds(getDoc(doc(db, 'users/alice')))
    await assertFails(getDoc(doc(db, 'users/bob')))
    await assertSucceeds(
      updateDoc(doc(db, 'users/alice'), { fullName: 'Alicia Gómez', updatedAt: new Date() }),
    )
    await assertFails(updateDoc(doc(db, 'users/alice'), { status: 'disabled' }))
  })
  it('usuario normal no crea artículos', async () => {
    const db = env.authenticatedContext('alice').firestore()
    await assertFails(setDoc(doc(db, 'articles/new'), { status: 'published' }))
  })
  it('permite crear únicamente el perfil propio al entrar con Google', async () => {
    const profile = {
      uid: 'google-user',
      fullName: 'Persona de Google',
      email: 'google@example.com',
      cedulaMasked: 'No registrada (Google)',
      status: 'active',
      authProvider: 'google.com',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    const googleDb = env
      .authenticatedContext('google-user', {
        email: 'google@example.com',
        firebase: { sign_in_provider: 'google.com' },
      })
      .firestore()
    await assertSucceeds(setDoc(doc(googleDb, 'users/google-user'), profile))
    await assertFails(
      setDoc(doc(googleDb, 'users/another-user'), { ...profile, uid: 'another-user' }),
    )

    const passwordDb = env
      .authenticatedContext('password-user', {
        email: 'google@example.com',
        firebase: { sign_in_provider: 'password' },
      })
      .firestore()
    await assertFails(
      setDoc(doc(passwordDb, 'users/password-user'), { ...profile, uid: 'password-user' }),
    )
  })
  it('usuario crea temas y respuestas del foro con su propia identidad', async () => {
    const db = env.authenticatedContext('alice').firestore()
    await assertSucceeds(
      setDoc(doc(db, 'forumPosts/topic'), {
        title: 'Una idea para mi comunidad',
        content: 'Podemos organizar encuentros comunitarios cada mes.',
        topic: 'comunidad',
        authorId: 'alice',
        authorName: 'Alicia Pérez',
        status: 'published',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )
    await assertSucceeds(
      setDoc(doc(db, 'forumPosts/topic/forumReplies/reply'), {
        content: 'Me gustaría participar.',
        authorId: 'alice',
        authorName: 'Alicia Pérez',
        status: 'published',
        createdAt: serverTimestamp(),
      }),
    )
  })
  it('visitante no publica y un usuario no suplanta a otra persona', async () => {
    const post = {
      title: 'Una idea para mi comunidad',
      content: 'Podemos organizar encuentros comunitarios cada mes.',
      topic: 'comunidad',
      authorId: 'alice',
      authorName: 'Alicia Pérez',
      status: 'published',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    await assertFails(setDoc(doc(env.unauthenticatedContext().firestore(), 'forumPosts/a'), post))
    await assertFails(
      setDoc(doc(env.authenticatedContext('bob').firestore(), 'forumPosts/b'), post),
    )
  })
  it('custom claim admin permite administrar', async () => {
    const db = env.authenticatedContext('editor', { admin: true }).firestore()
    await assertSucceeds(setDoc(doc(db, 'articles/new'), { status: 'draft', title: 'Nuevo' }))
    await assertSucceeds(updateDoc(doc(db, 'carousel/panel'), { active: false }))
    await assertFails(getDoc(doc(db, 'changeInterests/hash')))
  })
})
