export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

export function normalizeTags(value: string | string[]): string[] {
  const values = Array.isArray(value) ? value : value.split(',')
  return [...new Set(values.map((tag) => slugify(tag.trim())).filter(Boolean))].slice(0, 12)
}

export function keywordsFrom(...values: Array<string | string[]>): string[] {
  const joined = values
    .flat()
    .join(' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  return [...new Set(joined.split(/[^a-z0-9]+/).filter((word) => word.length >= 3))].slice(0, 80)
}

export function readingTime(markdown: string): number {
  const text = markdown.replace(/[`#>*_[\]()!-]/g, ' ')
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  return Math.max(1, Math.ceil(words / 220))
}

export function isSafeUrl(value: string): boolean {
  if (!value) return true
  if (value.startsWith('/') && !value.startsWith('//')) return true
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}
