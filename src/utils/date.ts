import type { Timestamp } from 'firebase/firestore'

export function toDate(value: Timestamp | Date | string | null | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'string') return new Date(value)
  return value.toDate()
}

export function formatDate(value: Timestamp | Date | string | null | undefined): string {
  const date = toDate(value)
  if (!date) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-DO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Santo_Domingo',
  }).format(date)
}
