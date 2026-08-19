import { createHash, randomUUID } from 'node:crypto'
import { getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https'

if (!getApps().length)
  initializeApp({
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET ||
      `${process.env.GCLOUD_PROJECT || 'demo-sumaterd'}.appspot.com`,
  })
export const adminAuth = getAuth()
export const db = getFirestore()
export const bucket = getStorage().bucket()
export { FieldValue, Timestamp, randomUUID }

export function assertAdmin(request: CallableRequest) {
  const emulator = process.env.FUNCTIONS_EMULATOR === 'true'
  if (!emulator && request.auth?.token.admin !== true)
    throw new HttpsError('permission-denied', 'Acceso no autorizado.')
}
export function cleanText(value: unknown, max = 500): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}
export function hashCedula(value: string): string {
  const secret =
    process.env.CEDULA_HASH_SECRET ||
    (process.env.FUNCTIONS_EMULATOR === 'true' ? 'local-emulator-only' : '')
  if (!secret) throw new HttpsError('failed-precondition', 'Configuración de identidad incompleta.')
  return createHash('sha256').update(`${secret}:${value}`).digest('hex')
}
export function hashPublicIdentifier(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}
export function normalizeCedula(value: unknown): string {
  return String(value || '')
    .replace(/\D/g, '')
    .slice(0, 11)
}
export function validCedula(value: string): boolean {
  if (value.length !== 11 || /^(\d)\1{10}$/.test(value)) return false
  const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2]
  const sum = value
    .slice(0, 10)
    .split('')
    .reduce((total, d, i) => {
      const p = Number(d) * weights[i]
      return total + (p >= 10 ? p - 9 : p)
    }, 0)
  return (10 - (sum % 10)) % 10 === Number(value[10])
}
export function serialize(data: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      value instanceof Timestamp ? value.toDate().toISOString() : value,
    ]),
  )
}
