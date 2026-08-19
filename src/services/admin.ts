import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase/client'
import type {
  AdminForumPost,
  AdminUserRecord,
  CarouselPanel,
  ChangeInterestRecord,
  ChangeInterestStatus,
  ForumReply,
  SiteSettings,
} from '../types'

export async function adminCarousel(
  action: 'list' | 'save' | 'delete' | 'reorder',
  payload: Record<string, unknown> = {},
) {
  const call = httpsCallable<Record<string, unknown>, { panels: CarouselPanel[] }>(
    functions,
    'adminCarousel',
  )
  return (await call({ action, ...payload })).data
}
export async function uploadAdminImage(
  file: File,
  area: 'articles' | 'carousel',
  ownerId: string,
  kind = 'cover',
) {
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
  const call = httpsCallable(functions, 'adminUploadImage')
  return (await call({ data, contentType: file.type, name: file.name, area, ownerId, kind }))
    .data as { url: string; path: string }
}
export async function deleteAdminImage(
  area: 'articles' | 'carousel',
  ownerId: string,
  kind = 'cover',
) {
  const call = httpsCallable(functions, 'adminDeleteImage')
  await call({ area, ownerId, kind })
}
export async function getSettings() {
  const call = httpsCallable<Record<string, unknown>, { settings: SiteSettings }>(
    functions,
    'adminSettings',
  )
  return (await call({ action: 'get' })).data.settings
}
export async function saveSettings(settings: SiteSettings) {
  const call = httpsCallable(functions, 'adminSettings')
  await call({ action: 'save', settings })
}

export async function adminUsers(
  action: 'list' | 'setStatus' | 'delete',
  payload: Record<string, unknown> = {},
) {
  const call = httpsCallable<
    Record<string, unknown>,
    { users?: AdminUserRecord[]; updated?: boolean; deleted?: boolean }
  >(functions, 'adminUsers')
  return (await call({ action, ...payload })).data
}

export async function adminForum(
  action: 'list' | 'setStatus' | 'delete' | 'replies' | 'setReplyStatus' | 'deleteReply',
  payload: Record<string, unknown> = {},
) {
  const call = httpsCallable<
    Record<string, unknown>,
    { posts?: AdminForumPost[]; replies?: ForumReply[]; updated?: boolean; deleted?: boolean }
  >(functions, 'adminForum')
  return (await call({ action, ...payload })).data
}

export async function adminChangeInterests(
  action: 'list' | 'setStatus' | 'delete',
  payload: { id?: string; status?: ChangeInterestStatus } = {},
) {
  const call = httpsCallable<
    Record<string, unknown>,
    { interests?: ChangeInterestRecord[]; updated?: boolean; deleted?: boolean }
  >(functions, 'adminChangeInterests')
  return (await call({ action, ...payload })).data
}
