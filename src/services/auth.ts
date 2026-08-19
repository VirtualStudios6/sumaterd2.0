import {
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile as updateAuthProfile,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { auth, db, functions } from '../firebase/client'
import { normalizeCedula } from '../utils/cedula'
import type { UserProfile } from '../types'

const genericError = new Error('Los datos introducidos no son correctos.')
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

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

export async function signInWithGoogle() {
  try {
    const credential = await signInWithPopup(auth, googleProvider)
    const user = credential.user
    const profileRef = doc(db, 'users', user.uid)
    const profile = await getDoc(profileRef)
    if (!profile.exists()) {
      const googleName = (user.displayName || '').trim().slice(0, 100)
      await setDoc(profileRef, {
        uid: user.uid,
        fullName: googleName.length >= 3 ? googleName : 'Miembro de SumateRD',
        email: user.email || '',
        cedulaMasked: 'No registrada (Google)',
        phone: '',
        province: '',
        municipality: '',
        bio: '',
        status: 'active',
        authProvider: 'google.com',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
    return credential
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return null
    if (code === 'auth/account-exists-with-different-credential') {
      throw new Error('Este correo ya está registrado. Inicia sesión con tu contraseña.')
    }
    await signOut(auth).catch(() => undefined)
    throw new Error('No pudimos iniciar sesión con Google. Intenta nuevamente.')
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
export async function updateProfileDetails(
  uid: string,
  input: {
    fullName: string
    phone: string
    province: string
    municipality: string
    bio: string
  },
) {
  const fullName = input.fullName.trim().slice(0, 100)
  await updateDoc(doc(db, 'users', uid), {
    fullName,
    phone: input.phone.trim().slice(0, 24),
    province: input.province.trim().slice(0, 60),
    municipality: input.municipality.trim().slice(0, 80),
    bio: input.bio.trim().slice(0, 280),
    updatedAt: serverTimestamp(),
  })
  if (auth.currentUser?.uid === uid && auth.currentUser.displayName !== fullName) {
    await updateAuthProfile(auth.currentUser, { displayName: fullName })
  }
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
