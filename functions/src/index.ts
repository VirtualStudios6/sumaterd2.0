import { logger } from 'firebase-functions'
import { defineSecret } from 'firebase-functions/params'
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https'
import {
  assertAdmin,
  adminAuth,
  bucket,
  cleanText,
  db,
  FieldValue,
  hashCedula,
  hashPublicIdentifier,
  normalizeCedula,
  randomUUID,
  serialize,
  validCedula,
} from './shared.js'

const changeParticipationOptions = new Set(['ideas', 'volunteer', 'organizer', 'information'])
const cedulaHashSecret = defineSecret('CEDULA_HASH_SECRET')

export const registerUser = onCall(
  { cors: true, enforceAppCheck: false, secrets: [cedulaHashSecret] },
  async (request) => {
    const fullName = cleanText(request.data?.fullName, 100)
    const email = cleanText(request.data?.email, 254).toLowerCase()
    const password = String(request.data?.password || '')
    const cedula = normalizeCedula(request.data?.cedula)
    if (
      fullName.length < 3 ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      password.length < 8 ||
      !validCedula(cedula)
    )
      throw new HttpsError('invalid-argument', 'No pudimos completar el registro.')
    const cedulaHash = hashCedula(cedula)
    let user
    try {
      user = await adminAuth.createUser({ email, password, displayName: fullName })
      await db.runTransaction(async (tx) => {
        const reservationRef = db.doc(`cedulaReservations/${cedulaHash}`)
        const reservation = await tx.get(reservationRef)
        if (reservation.exists)
          throw new HttpsError('already-exists', 'No pudimos completar el registro.')
        const now = FieldValue.serverTimestamp()
        tx.create(reservationRef, { uid: user!.uid, createdAt: now })
        tx.create(db.doc(`userPrivate/${user!.uid}`), { cedulaHash, createdAt: now })
        tx.create(db.doc(`users/${user!.uid}`), {
          uid: user!.uid,
          fullName,
          email,
          cedulaMasked: `***-*******-${cedula[10]}`,
          status: 'active',
          createdAt: now,
          updatedAt: now,
        })
      })
      return { uid: user.uid }
    } catch (error) {
      if (user) await adminAuth.deleteUser(user.uid).catch(() => undefined)
      logger.warn('Registro rechazado', {
        code: error instanceof HttpsError ? error.code : 'internal',
      })
      if (error instanceof HttpsError) throw error
      throw new HttpsError('already-exists', 'No pudimos completar el registro.')
    }
  },
)

export const registerChangeInterest = onCall(
  { cors: true, enforceAppCheck: false },
  async (request) => {
    const fullName = cleanText(request.data?.fullName, 100)
    const email = cleanText(request.data?.email, 254).toLowerCase()
    const phone = String(request.data?.phone || '').replace(/\D/g, '')
    const province = cleanText(request.data?.province, 80)
    const municipality = cleanText(request.data?.municipality, 80)
    const participation = cleanText(request.data?.participation, 30)
    const adultConfirmed = request.data?.adultConfirmed === true
    const sensitiveDataConsent = request.data?.sensitiveDataConsent === true
    const honeypot = cleanText(request.data?.website, 200)

    if (honeypot) return { received: true, reference: 'RECIBIDO' }
    if (
      fullName.length < 3 ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      !province ||
      !changeParticipationOptions.has(participation) ||
      !adultConfirmed ||
      !sensitiveDataConsent ||
      (phone.length > 0 && !/^\d{10,11}$/.test(phone))
    )
      throw new HttpsError('invalid-argument', 'Solicitud incompleta.')

    const ref = db.doc(`changeInterests/${hashPublicIdentifier(email)}`)
    return db.runTransaction(async (tx) => {
      const current = await tx.get(ref)
      if (current.exists)
        return {
          received: true,
          reference: String(current.get('reference') || 'RECIBIDO'),
        }

      const reference = `CAM-${randomUUID().slice(0, 8).toUpperCase()}`
      tx.create(ref, {
        fullName,
        email,
        phone,
        province,
        municipality,
        participation,
        adultConfirmed: true,
        sensitiveDataConsent: true,
        consentVersion: 'change-interest-2026-08-19-v1',
        formalAffiliation: false,
        status: 'new',
        reference,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
      return { received: true, reference }
    })
  },
)

export const verifyCedula = onCall({ cors: true, secrets: [cedulaHashSecret] }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'No autorizado.')
  const cedula = normalizeCedula(request.data?.cedula)
  if (!validCedula(cedula)) return { valid: false }
  const snap = await db.doc(`cedulaReservations/${hashCedula(cedula)}`).get()
  return { valid: snap.exists && snap.get('uid') === request.auth.uid }
})

export const deleteOwnAccount = onCall({ cors: true }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'No autorizado.')
  const uid = request.auth.uid
  const privateRef = db.doc(`userPrivate/${uid}`)
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(privateRef)
    if (snap.exists) tx.delete(db.doc(`cedulaReservations/${snap.get('cedulaHash')}`))
    tx.delete(privateRef)
    tx.delete(db.doc(`users/${uid}`))
  })
  await adminAuth.deleteUser(uid)
  return { deleted: true }
})

export const adminArticles = onCall({ cors: true }, async (request) => {
  assertAdmin(request)
  const action = request.data?.action
  if (action === 'list') {
    let q: FirebaseFirestore.Query = db
      .collection('articles')
      .orderBy('updatedAt', 'desc')
      .limit(100)
    if (request.data?.status)
      q = db
        .collection('articles')
        .where('status', '==', request.data.status)
        .orderBy('updatedAt', 'desc')
        .limit(100)
    const snap = await q.get()
    return { articles: snap.docs.map((d) => ({ id: d.id, ...serialize(d.data()) })) }
  }
  if (action === 'get') {
    const snap = await db.doc(`articles/${cleanText(request.data?.id, 100)}`).get()
    return { article: snap.exists ? { id: snap.id, ...serialize(snap.data()!) } : null }
  }
  if (action === 'delete') {
    const id = cleanText(request.data?.id, 100)
    if (!id) throw new HttpsError('invalid-argument', 'ID requerido.')
    await db.doc(`articles/${id}`).delete()
    await bucket.deleteFiles({ prefix: `articles/${id}/` }).catch(() => undefined)
    return { deleted: true }
  }
  if (action !== 'save') throw new HttpsError('invalid-argument', 'Acción inválida.')
  const input = request.data?.article || {}
  const id = cleanText(input.id, 100) || db.collection('articles').doc().id
  const ref = db.doc(`articles/${id}`)
  const title = cleanText(input.title, 180)
  const desiredSlug = slugify(cleanText(input.slug, 120) || title)
  if (!title || !desiredSlug) throw new HttpsError('invalid-argument', 'Título y slug requeridos.')
  const resultSlug = await db.runTransaction(async (tx) => {
    let candidate = desiredSlug
    let suffix = 2
    while (true) {
      const collision = await tx.get(
        db.collection('articles').where('slug', '==', candidate).limit(1),
      )
      if (collision.empty || collision.docs[0].id === id) break
      candidate = `${desiredSlug}-${suffix++}`
    }
    const current = await tx.get(ref)
    const now = FieldValue.serverTimestamp()
    const status = input.status === 'published' ? 'published' : 'draft'
    const data = {
      title,
      slug: candidate,
      summary: cleanText(input.summary, 320),
      content: String(input.content || '').slice(0, 200000),
      coverImage: cleanText(input.coverImage, 2000),
      coverImageAlt: cleanText(input.coverImageAlt, 240),
      authorId: cleanText(input.authorId, 100) || 'editorial',
      authorName: cleanText(input.authorName, 100) || 'Redacción SumateRD',
      category: cleanText(input.category, 40),
      tags: Array.isArray(input.tags)
        ? input.tags.slice(0, 12).map((x: unknown) => cleanText(x, 40))
        : [],
      keywords: Array.isArray(input.keywords)
        ? input.keywords.slice(0, 80).map((x: unknown) => cleanText(x, 40))
        : [],
      status,
      featured: input.featured === true,
      readingTime: Math.max(1, Number(input.readingTime) || 1),
      seoTitle: cleanText(input.seoTitle, 70),
      seoDescription: cleanText(input.seoDescription, 160),
      updatedAt: now,
      ...(current.exists ? {} : { createdAt: now }),
      ...(status === 'published' && current.get('status') !== 'published'
        ? { publishedAt: now }
        : {}),
    }
    tx.set(ref, data, { merge: true })
    return candidate
  })
  return { id, slug: resultSlug }
})

export const adminCarousel = onCall({ cors: true }, async (request) => {
  assertAdmin(request)
  const action = request.data?.action
  if (action === 'list') {
    const snap = await db.collection('carousel').orderBy('order').get()
    return { panels: snap.docs.map((d) => ({ id: d.id, ...serialize(d.data()) })) }
  }
  if (action === 'delete') {
    const id = cleanText(request.data?.id, 100)
    await db.doc(`carousel/${id}`).delete()
    await bucket.deleteFiles({ prefix: `carousel/${id}/` }).catch(() => undefined)
    return { deleted: true }
  }
  if (action === 'reorder') {
    const ids = Array.isArray(request.data?.ids) ? request.data.ids.slice(0, 30) : []
    const batch = db.batch()
    ids.forEach((id: string, index: number) =>
      batch.update(db.doc(`carousel/${cleanText(id, 100)}`), {
        order: index,
        updatedAt: FieldValue.serverTimestamp(),
      }),
    )
    await batch.commit()
    return { reordered: true }
  }
  if (action === 'save') {
    const p = request.data?.panel || {}
    const id = cleanText(p.id, 100) || db.collection('carousel').doc().id
    const ref = db.doc(`carousel/${id}`)
    const current = await ref.get()
    const url = cleanText(p.buttonUrl, 2000)
    if (url && !safeUrl(url)) throw new HttpsError('invalid-argument', 'Enlace no permitido.')
    await ref.set(
      {
        title: cleanText(p.title, 150),
        message: cleanText(p.message, 400),
        imageUrl: cleanText(p.imageUrl, 2000),
        imageAlt: cleanText(p.imageAlt, 240),
        buttonText: cleanText(p.buttonText, 80),
        buttonUrl: url,
        active: p.active === true,
        order: Math.max(0, Number(p.order) || 0),
        updatedAt: FieldValue.serverTimestamp(),
        ...(current.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
      },
      { merge: true },
    )
    return { id }
  }
  throw new HttpsError('invalid-argument', 'Acción inválida.')
})

export const adminUploadImage = onCall(
  { cors: true, timeoutSeconds: 60, memory: '512MiB' },
  async (request) => {
    assertAdmin(request)
    const contentType = cleanText(request.data?.contentType, 50)
    const area = request.data?.area === 'carousel' ? 'carousel' : 'articles'
    const ownerId = cleanText(request.data?.ownerId, 100).replace(/[^a-zA-Z0-9_-]/g, '')
    const kind = cleanText(request.data?.kind, 30).replace(/[^a-zA-Z0-9_-]/g, '') || 'cover'
    const buffer = Buffer.from(String(request.data?.data || ''), 'base64')
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(contentType) ||
      buffer.length === 0 ||
      buffer.length > 5 * 1024 * 1024 ||
      !validMagic(buffer, contentType) ||
      !ownerId
    )
      throw new HttpsError('invalid-argument', 'Imagen inválida.')
    const ext = contentType === 'image/jpeg' ? 'jpg' : contentType.split('/')[1]
    const prefix = `${area}/${ownerId}/${kind}/`
    if (kind !== 'content') await bucket.deleteFiles({ prefix }).catch(() => undefined)
    const token = randomUUID()
    const path = `${prefix}${randomUUID()}.${ext}`
    await bucket.file(path).save(buffer, {
      resumable: false,
      metadata: {
        contentType,
        cacheControl: 'public,max-age=31536000,immutable',
        metadata: { firebaseStorageDownloadTokens: token },
      },
    })
    const encoded = encodeURIComponent(path)
    return {
      path,
      url: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encoded}?alt=media&token=${token}`,
    }
  },
)

export const adminDeleteImage = onCall({ cors: true }, async (request) => {
  assertAdmin(request)
  const area = request.data?.area === 'carousel' ? 'carousel' : 'articles'
  const ownerId = cleanText(request.data?.ownerId, 100).replace(/[^a-zA-Z0-9_-]/g, '')
  const kind = cleanText(request.data?.kind, 30).replace(/[^a-zA-Z0-9_-]/g, '') || 'cover'
  if (!ownerId) throw new HttpsError('invalid-argument', 'Ruta inválida.')
  await bucket.deleteFiles({ prefix: `${area}/${ownerId}/${kind}/` })
  return { deleted: true }
})

export const adminSettings = onCall({ cors: true }, async (request) => {
  assertAdmin(request)
  const ref = db.doc('settings/public')
  if (request.data?.action === 'get') {
    const snap = await ref.get()
    return { settings: snap.exists ? serialize(snap.data()!) : null }
  }
  if (request.data?.action === 'save') {
    const s = request.data?.settings || {}
    await ref.set(
      {
        public: true,
        siteName: cleanText(s.siteName, 80),
        tagline: cleanText(s.tagline, 180),
        contactEmail: cleanText(s.contactEmail, 254),
        aboutText: cleanText(s.aboutText, 600),
        footerText: cleanText(s.footerText, 180),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
    return { saved: true }
  }
  throw new HttpsError('invalid-argument', 'Acción inválida.')
})
export const adminStats = onCall({ cors: true }, async (request) => {
  assertAdmin(request)
  const [all, published, drafts, panels, users, forumPosts, changeInterests] = await Promise.all([
    db.collection('articles').count().get(),
    db.collection('articles').where('status', '==', 'published').count().get(),
    db.collection('articles').where('status', '==', 'draft').count().get(),
    db.collection('carousel').where('active', '==', true).count().get(),
    db.collection('users').count().get(),
    db.collection('forumPosts').count().get(),
    db.collection('changeInterests').count().get(),
  ])
  return {
    total: all.data().count,
    published: published.data().count,
    drafts: drafts.data().count,
    panels: panels.data().count,
    users: users.data().count,
    forumPosts: forumPosts.data().count,
    changeInterests: changeInterests.data().count,
  }
})

export const adminUsers = onCall({ cors: true }, async (request) => {
  assertAdmin(request)
  const action = request.data?.action
  if (action === 'list') {
    const snap = await db.collection('users').orderBy('createdAt', 'desc').limit(250).get()
    const users = await Promise.all(
      snap.docs.map(async (item) => {
        const record = await adminAuth.getUser(item.id).catch(() => null)
        return {
          id: item.id,
          ...serialize(item.data()),
          disabled: record?.disabled === true,
        }
      }),
    )
    return { users }
  }
  const uid = cleanText(request.data?.uid, 128)
  if (!uid) throw new HttpsError('invalid-argument', 'Usuario requerido.')
  if (uid === request.auth?.uid)
    throw new HttpsError('failed-precondition', 'No puedes modificar tu propia cuenta aquí.')
  if (action === 'setStatus') {
    const status = request.data?.status === 'disabled' ? 'disabled' : 'active'
    await Promise.all([
      adminAuth.updateUser(uid, { disabled: status === 'disabled' }),
      db
        .doc(`users/${uid}`)
        .set({ status, updatedAt: FieldValue.serverTimestamp() }, { merge: true }),
    ])
    return { updated: true }
  }
  if (action === 'delete') {
    const privateRef = db.doc(`userPrivate/${uid}`)
    await db.runTransaction(async (tx) => {
      const privateSnap = await tx.get(privateRef)
      if (privateSnap.exists) {
        const cedulaHash = cleanText(privateSnap.get('cedulaHash'), 128)
        if (cedulaHash) tx.delete(db.doc(`cedulaReservations/${cedulaHash}`))
      }
      tx.delete(privateRef)
      tx.delete(db.doc(`users/${uid}`))
    })
    await adminAuth.deleteUser(uid).catch((error: { code?: string }) => {
      if (error.code !== 'auth/user-not-found') throw error
    })
    return { deleted: true }
  }
  throw new HttpsError('invalid-argument', 'Acción inválida.')
})

export const adminForum = onCall({ cors: true }, async (request) => {
  assertAdmin(request)
  const action = request.data?.action
  if (action === 'list') {
    const snap = await db.collection('forumPosts').orderBy('createdAt', 'desc').limit(200).get()
    const posts = await Promise.all(
      snap.docs.map(async (item) => ({
        id: item.id,
        ...serialize(item.data()),
        replyCount: (await item.ref.collection('forumReplies').count().get()).data().count,
      })),
    )
    return { posts }
  }
  const postId = cleanText(request.data?.postId, 128)
  if (!postId) throw new HttpsError('invalid-argument', 'Conversación requerida.')
  const postRef = db.doc(`forumPosts/${postId}`)
  if (action === 'replies') {
    const snap = await postRef
      .collection('forumReplies')
      .orderBy('createdAt', 'asc')
      .limit(300)
      .get()
    return { replies: snap.docs.map((item) => ({ id: item.id, ...serialize(item.data()) })) }
  }
  if (action === 'setStatus') {
    const status = request.data?.status === 'published' ? 'published' : 'hidden'
    await postRef.update({ status, updatedAt: FieldValue.serverTimestamp() })
    return { updated: true }
  }
  if (action === 'delete') {
    await db.recursiveDelete(postRef)
    return { deleted: true }
  }
  const replyId = cleanText(request.data?.replyId, 128)
  if (!replyId) throw new HttpsError('invalid-argument', 'Respuesta requerida.')
  const replyRef = postRef.collection('forumReplies').doc(replyId)
  if (action === 'setReplyStatus') {
    const status = request.data?.status === 'published' ? 'published' : 'hidden'
    await replyRef.update({ status })
    return { updated: true }
  }
  if (action === 'deleteReply') {
    await replyRef.delete()
    return { deleted: true }
  }
  throw new HttpsError('invalid-argument', 'Acción inválida.')
})

export const adminChangeInterests = onCall({ cors: true }, async (request) => {
  assertAdmin(request)
  const action = request.data?.action
  if (action === 'list') {
    const snap = await db
      .collection('changeInterests')
      .orderBy('createdAt', 'desc')
      .limit(500)
      .get()
    return {
      interests: snap.docs.map((item) => ({ id: item.id, ...serialize(item.data()) })),
    }
  }
  const id = cleanText(request.data?.id, 128)
  if (!id) throw new HttpsError('invalid-argument', 'Solicitud requerida.')
  const ref = db.doc(`changeInterests/${id}`)
  if (action === 'setStatus') {
    const allowed = new Set(['new', 'contacted', 'accepted', 'closed'])
    const status = cleanText(request.data?.status, 20)
    if (!allowed.has(status)) throw new HttpsError('invalid-argument', 'Estado inválido.')
    await ref.update({ status, updatedAt: FieldValue.serverTimestamp() })
    return { updated: true }
  }
  if (action === 'delete') {
    await ref.delete()
    return { deleted: true }
  }
  throw new HttpsError('invalid-argument', 'Acción inválida.')
})

export const sitemap = onRequest({ cors: true }, async (_request, response) => {
  const configured = process.env.SITE_URL
  if (!configured && process.env.FUNCTIONS_EMULATOR !== 'true') {
    response.status(503).send('SITE_URL no configurado')
    return
  }
  const site = (configured || 'http://localhost:5173').replace(/\/$/, '')
  const snap = await db
    .collection('articles')
    .where('status', '==', 'published')
    .orderBy('publishedAt', 'desc')
    .get()
  const publicCategories = ['opinion', 'sociedad', 'cambio']
  const fixed = ['', ...publicCategories.map((c) => `/categoria/${c}`)]
  const urls = [
    ...fixed.map((path) => ({ loc: `${site}${path}`, lastmod: '' })),
    ...snap.docs
      .filter((doc) => publicCategories.includes(doc.get('category')))
      .map((doc) => ({
        loc: `${site}/articulo/${doc.get('slug')}`,
        lastmod: doc.get('updatedAt')?.toDate?.().toISOString() || '',
      })),
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>`
  response.set('Cache-Control', 'public,max-age=3600,s-maxage=3600')
  response.type('application/xml').send(xml)
})

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}
function safeUrl(value: string) {
  if (value.startsWith('/') && !value.startsWith('//')) return true
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}
function validMagic(buffer: Buffer, type: string) {
  if (type === 'image/jpeg') return buffer[0] === 0xff && buffer[1] === 0xd8
  if (type === 'image/png')
    return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  if (type === 'image/webp')
    return (
      buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP'
    )
  return false
}
function escapeXml(value: string) {
  return value.replace(
    /[<>&'"]/g,
    (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char]!,
  )
}
