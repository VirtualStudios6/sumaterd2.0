import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { auth, db, functions } from '../firebase/client'
import { normalizeCedula } from '../utils/cedula'
import type { UserProfile } from '../types'

const genericError = new Error('Los datos introducidos no son correctos.')

export async function registerUser(input: {
  fullName: string
  cedula: string
  email: string
  password: string
}) {
  const call = httpsCallable<typeof input, { uid: string }>(functions, 'registerUser')
  await call({
    ...input,
    cedula: normalizeCedula(input.cedula),
    email: input.email.trim().toLowerCase(),
  })
  return signInWithEmailAndPassword(auth, input.email.trim().toLowerCase(), input.password)
}

export async function loginUser(email: string, password: string, cedula: string) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password)
    const verify = httpsCallable<{ cedula: string }, { valid: boolean }>(functions, 'verifyCedula')
    const result = await verify({ cedula: normalizeCedula(cedula) })
    if (!result.data.valid) throw genericError
    return credential
  } catch {
    await signOut(auth).catch(() => undefined)
    throw genericError
  }
}

export function logoutUser() {
  return signOut(auth)
}
export function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email.trim().toLowerCase())
}
export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as unknown as UserProfile) : null
}
export async function updateProfileName(uid: string, fullName: string) {
  await updateDoc(doc(db, 'users', uid), {
    fullName: fullName.trim(),
    updatedAt: serverTimestamp(),
  })
}
export async function changePassword(currentPassword: string, nextPassword: string) {
  const user = auth.currentUser
  if (!user?.email) throw new Error('Debes iniciar sesión nuevamente.')
  await reauthenticateWithCredential(
    user,
    EmailAuthProvider.credential(user.email, currentPassword),
  )
  await updatePassword(user, nextPassword)
}
export async function deleteAccountSecurely() {
  const call = httpsCallable(functions, 'deleteOwnAccount')
  await call()
  await signOut(auth)
}
