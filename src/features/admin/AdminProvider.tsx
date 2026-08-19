import {
  getIdTokenResult,
  onIdTokenChanged,
  signInWithEmailAndPassword,
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
  logout: () => Promise<void>
}
const AdminContext = createContext<AdminState | null>(null)

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
          const token = await getIdTokenResult(credential.user, true)
          if (token.claims.admin !== true) {
            await signOut(auth)
            throw new Error('Esta cuenta no tiene permisos administrativos.')
          }
          setUser(credential.user)
          setAuthenticated(true)
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
