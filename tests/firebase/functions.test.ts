import { describe, expect, it } from 'vitest'

const functionsBase = 'http://127.0.0.1:5001/sumaterd-da931/us-central1'
const authBase = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1'

async function callable<T>(name: string, data: unknown, token?: string): Promise<T> {
  const response = await fetch(`${functionsBase}/${name}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ data }),
  })
  const body = (await response.json()) as {
    result?: T
    error?: { status: string; message: string }
  }
  if (!response.ok || body.error) throw new Error(body.error?.status || `HTTP ${response.status}`)
  return body.result as T
}
async function signIn(email: string, password: string) {
  const response = await fetch(`${authBase}/accounts:signInWithPassword?key=demo-key`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  })
  return response.json() as Promise<{ idToken: string }>
}

describe('Functions de identidad', () => {
  it('registra, reserva una cédula única y verifica el login sin filtrar datos', async () => {
    const email = `lectora-${Date.now()}@example.test`
    const password = 'Clave-segura-2026'
    const cedula = '00113918296'
    const created = await callable<{ uid: string }>('registerUser', {
      fullName: 'María Pérez',
      email,
      password,
      cedula,
    })
    expect(created.uid).toBeTruthy()
    await expect(
      callable('registerUser', {
        fullName: 'Otra Persona',
        email: 'otra@example.test',
        password,
        cedula,
      }),
    ).rejects.toThrow()
    const auth = await signIn(email, password)
    expect(
      (await callable<{ valid: boolean }>('verifyCedula', { cedula }, auth.idToken)).valid,
    ).toBe(true)
    const existing = await callable<{ registered: boolean; cedulaMasked: string }>(
      'registerOwnCedula',
      { cedula },
      auth.idToken,
    )
    expect(existing.registered).toBe(false)
    expect(existing.cedulaMasked).toMatch(/^\*{3}-\*{7}-\d$/)
    expect(
      (await callable<{ valid: boolean }>('verifyCedula', { cedula: '00113918295' }, auth.idToken))
        .valid,
    ).toBe(false)
  })
  it('rechaza registro con cédula inválida y procesa reset sin revelar cuenta', async () => {
    await expect(
      callable('registerUser', {
        fullName: 'Nombre Válido',
        email: 'invalid@example.test',
        password: 'Clave-segura-2026',
        cedula: '00113918295',
      }),
    ).rejects.toThrow()
    const response = await fetch(`${authBase}/accounts:sendOobCode?key=demo-key`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ requestType: 'PASSWORD_RESET', email: 'no-existe@example.test' }),
    })
    expect([200, 400]).toContain(response.status)
  })
})

describe('Registro de interÃ©s de Proyecto Cambio', () => {
  it('guarda una manifestaciÃ³n voluntaria y evita duplicados por correo', async () => {
    const email = `cambio-${Date.now()}@example.test`
    const interest = {
      fullName: 'Ciudadana de Prueba',
      email,
      phone: '8095550101',
      province: 'Santo Domingo',
      municipality: 'Santo Domingo Este',
      participation: 'ideas',
      adultConfirmed: true,
      sensitiveDataConsent: true,
      website: '',
    }
    const first = await callable<{ received: boolean; reference: string }>(
      'registerChangeInterest',
      interest,
    )
    const repeated = await callable<{ received: boolean; reference: string }>(
      'registerChangeInterest',
      interest,
    )
    expect(first.received).toBe(true)
    expect(first.reference).toMatch(/^CAM-/)
    expect(repeated.reference).toBe(first.reference)
  })

  it('rechaza solicitudes sin consentimiento sensible', async () => {
    await expect(
      callable('registerChangeInterest', {
        fullName: 'Ciudadano de Prueba',
        email: 'sin-consentimiento@example.test',
        province: 'Santiago',
        participation: 'volunteer',
        adultConfirmed: true,
        sensitiveDataConsent: false,
      }),
    ).rejects.toThrow()
  })
})

describe('Functions del CMS en Emulator Suite', () => {
  it('conecta los módulos administrativos de usuarios, foro y solicitudes', async () => {
    const email = `admin-modules-${Date.now()}@example.test`
    await callable('registerUser', {
      fullName: 'Usuario de Gestión',
      email,
      password: 'Clave-segura-2026',
      cedula: '00113918296',
    }).catch(() => undefined)
    const users = await callable<{ users: Array<{ email: string }> }>('adminUsers', {
      action: 'list',
    })
    expect(Array.isArray(users.users)).toBe(true)

    const forum = await callable<{ posts: unknown[] }>('adminForum', { action: 'list' })
    expect(Array.isArray(forum.posts)).toBe(true)

    const interestEmail = `gestion-cambio-${Date.now()}@example.test`
    await callable('registerChangeInterest', {
      fullName: 'Solicitud para Gestión',
      email: interestEmail,
      province: 'Santiago',
      participation: 'information',
      adultConfirmed: true,
      sensitiveDataConsent: true,
    })
    const interests = await callable<{
      interests: Array<{ id: string; email: string; status: string }>
    }>('adminChangeInterests', { action: 'list' })
    const interest = interests.interests.find((item) => item.email === interestEmail)
    expect(interest?.status).toBe('new')
    await callable('adminChangeInterests', {
      action: 'setStatus',
      id: interest?.id,
      status: 'contacted',
    })
    const updated = await callable<{
      interests: Array<{ id: string; status: string }>
    }>('adminChangeInterests', { action: 'list' })
    expect(updated.interests.find((item) => item.id === interest?.id)?.status).toBe('contacted')
  })
  it('crea borrador, garantiza slug único, publica, lista y elimina', async () => {
    const first = await callable<{ id: string; slug: string }>('adminArticles', {
      action: 'save',
      article: {
        title: 'Tema de prueba',
        slug: 'tema-de-prueba',
        summary: 'Resumen',
        content: 'Contenido editorial',
        category: 'actualidad',
        tags: ['prueba'],
        keywords: ['prueba'],
        status: 'draft',
        authorName: 'Redacción',
        readingTime: 1,
      },
    })
    const second = await callable<{ id: string; slug: string }>('adminArticles', {
      action: 'save',
      article: {
        title: 'Otro tema',
        slug: 'tema-de-prueba',
        summary: 'Resumen',
        content: 'Contenido',
        category: 'opinion',
        status: 'draft',
        authorName: 'Redacción',
        readingTime: 1,
      },
    })
    expect(first.slug).toBe('tema-de-prueba')
    expect(second.slug).toBe('tema-de-prueba-2')
    await callable('adminArticles', {
      action: 'save',
      article: {
        id: first.id,
        title: 'Tema de prueba',
        slug: first.slug,
        summary: 'Resumen',
        content: 'Contenido actualizado',
        category: 'actualidad',
        tags: ['prueba'],
        keywords: ['prueba'],
        status: 'published',
        authorName: 'Redacción',
        readingTime: 1,
      },
    })
    const list = await callable<{ articles: Array<{ id: string; status: string }> }>(
      'adminArticles',
      { action: 'list', status: 'published' },
    )
    expect(
      list.articles.some((article) => article.id === first.id && article.status === 'published'),
    ).toBe(true)
    await callable('adminArticles', { action: 'delete', id: second.id })
    const deleted = await callable<{ article: null }>('adminArticles', {
      action: 'get',
      id: second.id,
    })
    expect(deleted.article).toBeNull()
  })
  it('persiste y reordena el carrusel', async () => {
    const panelA = {
      id: `panel-a-${Date.now()}`,
      title: 'Primero',
      message: 'Mensaje',
      imageUrl: 'https://example.test/a.webp',
      imageAlt: 'Primero',
      buttonText: 'Leer',
      buttonUrl: '/articulo/tema',
      active: true,
      order: 0,
    }
    const panelB = { ...panelA, id: `panel-b-${Date.now()}`, title: 'Segundo', order: 1 }
    await callable('adminCarousel', { action: 'save', panel: panelA })
    await callable('adminCarousel', { action: 'save', panel: panelB })
    await callable('adminCarousel', { action: 'reorder', ids: [panelB.id, panelA.id] })
    const result = await callable<{ panels: Array<{ id: string; order: number }> }>(
      'adminCarousel',
      { action: 'list' },
    )
    const own = result.panels.filter((p) => [panelA.id, panelB.id].includes(p.id))
    expect(own.map((p) => p.id)).toEqual([panelB.id, panelA.id])
    expect(own.map((p) => p.order)).toEqual([0, 1])
    await callable('adminCarousel', { action: 'delete', id: panelA.id })
    await callable('adminCarousel', { action: 'delete', id: panelB.id })
  })
  it('sube y elimina una imagen validada en Storage', async () => {
    const ownerId = `upload-${Date.now()}`
    const uploaded = await callable<{ url: string; path: string }>('adminUploadImage', {
      area: 'articles',
      ownerId,
      kind: 'cover',
      name: 'portada.png',
      contentType: 'image/png',
      data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    })
    expect(uploaded.path).toContain(`articles/${ownerId}/cover/`)
    expect(uploaded.url).toContain('firebasestorage.googleapis.com')
    await expect(
      callable('adminDeleteImage', { area: 'articles', ownerId, kind: 'cover' }),
    ).resolves.toBeTruthy()
  })
})
