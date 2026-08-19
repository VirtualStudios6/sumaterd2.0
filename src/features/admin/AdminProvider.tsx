import {
  getIdTokenResult,
  GoogleAuthProvider,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { auth } from '../../firebase/client'

interface AdminState {
  authenticated: boolean
  loading: boolean
  user: User | null
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<boolean>
  logout: () => Promise<void>
}
const AdminContext = createContext<AdminState | null>(null)
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

async function verifyAdmin(user: User) {
  const token = await getIdTokenResult(user, true)
  if (token.claims.admin !== true) {
    await signOut(auth)
    throw new Error('Esta cuenta de Google no tiene permisos administrativos.')
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  useEffect(
    () =>
      onIdTokenChanged(auth, async (nextUser) => {
        if (!nextUser) {
          setUser(null)
          setAuthenticated(false)
          setLoading(false)
          return
        }
        try {
          const token = await getIdTokenResult(nextUser, true)
          const isAdmin = token.claims.admin === true
          setUser(isAdmin ? nextUser : null)
          setAuthenticated(isAdmin)
        } catch {
          setUser(null)
          setAuthenticated(false)
        } finally {
          setLoading(false)
        }
      }),
    [],
  )
  const value = useMemo<AdminState>(
    () => ({
      authenticated,
      loading,
      user,
      async login(email, password) {
        setLoading(true)
        try {
          const credential = await signInWithEmailAndPassword(
            auth,
            email.trim().toLowerCase(),
            password,
          )
          await verifyAdmin(credential.user)
          setUser(credential.user)
          setAuthenticated(true)
        } finally {
          setLoading(false)
        }
      },
      async loginWithGoogle() {
        setLoading(true)
        try {
          const credential = await signInWithPopup(auth, googleProvider)
          await verifyAdmin(credential.user)
          setUser(credential.user)
          setAuthenticated(true)
          return true
        } catch (error) {
          const code =
            typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
          if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
            return false
          }
          if (code === 'auth/account-exists-with-different-credential') {
            throw new Error('Esta cuenta ya existe con otro método de acceso.')
          }
          if (error instanceof Error && error.message.includes('permisos administrativos')) {
            throw error
          }
          throw new Error('No pudimos verificar esta cuenta de Google. Intenta nuevamente.')
        } finally {
          setLoading(false)
        }
      },
      async logout() {
        await signOut(auth)
        setUser(null)
        setAuthenticated(false)
      },
    }),
    [authenticated, loading, user],
  )
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}
export function useAdmin() {
  const value = useContext(AdminContext)
  if (!value) throw new Error('AdminProvider no disponible')
  return value
}
