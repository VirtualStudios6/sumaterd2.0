const WEIGHTS = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2]

export function normalizeCedula(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11)
}

export function formatCedula(value: string): string {
  const digits = normalizeCedula(value)
  if (digits.length <= 3) return digits
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`
}

export function maskCedula(value: string): string {
  const digits = normalizeCedula(value)
  return digits.length === 11 ? `***-*******-${digits[10]}` : '***-*******-*'
}

export function isValidCedula(value: string): boolean {
  const digits = normalizeCedula(value)
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false
  const sum = digits
    .slice(0, 10)
    .split('')
    .reduce((total, digit, index) => {
      const product = Number(digit) * WEIGHTS[index]
      return total + (product >= 10 ? product - 9 : product)
    }, 0)
  const verifier = (10 - (sum % 10)) % 10
  return verifier === Number(digits[10])
}
