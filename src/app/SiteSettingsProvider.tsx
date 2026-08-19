import { doc, getDoc } from 'firebase/firestore'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { db } from '../firebase/client'
import type { SiteSettings } from '../types'

const defaults: SiteSettings = {
  siteName: 'SumateRD',
  tagline: 'República Dominicana en conversación',
  contactEmail: '',
  aboutText:
    'SumateRD es un espacio para informar, conversar y construir propuestas para la República Dominicana.',
  footerText: 'Opinión, sociedad y participación desde República Dominicana.',
}

const SiteSettingsContext = createContext<SiteSettings>(defaults)

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaults)
  useEffect(() => {
    getDoc(doc(db, 'settings', 'public'))
      .then((snapshot) => {
        if (snapshot.exists()) setSettings({ ...defaults, ...(snapshot.data() as SiteSettings) })
      })
      .catch(() => undefined)
  }, [])
  return (
    <SiteSettingsContext.Provider value={useMemo(() => settings, [settings])}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export const useSiteSettings = () => useContext(SiteSettingsContext)
