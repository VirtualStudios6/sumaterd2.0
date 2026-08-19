import { describe, expect, it } from 'vitest'
import { formatCedula, isValidCedula, maskCedula, normalizeCedula } from '../src/utils/cedula'
import { isSafeUrl, normalizeTags, readingTime, slugify } from '../src/utils/content'

describe('cédula dominicana', () => {
  it('normaliza, formatea y oculta', () => {
    expect(normalizeCedula('001-1391829-6')).toBe('00113918296')
    expect(formatCedula('00113918296')).toBe('001-1391829-6')
    expect(maskCedula('00113918296')).toBe('***-*******-6')
  })
  it('valida el dígito verificador y rechaza repeticiones', () => {
    expect(isValidCedula('001-1391829-6')).toBe(true)
    expect(isValidCedula('001-1391829-5')).toBe(false)
    expect(isValidCedula('111-1111111-1')).toBe(false)
  })
})
describe('contenido editorial', () => {
  it('genera slugs estables', () =>
    expect(slugify('¿Por qué República Dominicana?')).toBe('por-que-republica-dominicana'))
  it('normaliza etiquetas sin duplicados', () =>
    expect(normalizeTags('Política, política, Economía')).toEqual(['politica', 'economia']))
  it('calcula minutos con mínimo uno', () => {
    expect(readingTime('')).toBe(1)
    expect(readingTime(Array(441).fill('palabra').join(' '))).toBe(3)
  })
  it('rechaza protocolos peligrosos', () => {
    expect(isSafeUrl('/articulo/uno')).toBe(true)
    expect(isSafeUrl('https://sumaterd.com')).toBe(true)
    expect(isSafeUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeUrl('//evil.test')).toBe(false)
  })
})
