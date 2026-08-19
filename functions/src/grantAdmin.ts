import { adminAuth } from './shared.js'

const email = String(process.argv[2] || process.env.SUMATERD_ADMIN_EMAIL || '')
  .trim()
  .toLowerCase()

if (!/^\S+@\S+\.\S+$/.test(email)) {
  console.error('Uso: npm run grant-admin -- correo@dominio.com')
  process.exit(1)
}

const user = await adminAuth.getUserByEmail(email)
await adminAuth.setCustomUserClaims(user.uid, {
  ...user.customClaims,
  admin: true,
})
console.log(`Permiso administrativo activado para ${email}.`)
