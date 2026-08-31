import { doc, getDoc } from 'firebase/firestore'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { db } from '../firebase/client'
import { DEFAULT_SITE_SETTINGS } from '../lib/siteSettings'
import type { SiteSettings } from '../types'

const SiteSettingsContext = createContext<SiteSettings>(DEFAULT_SITE_SETTINGS)

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS)
  useEffect(() => {
    getDoc(doc(db, 'settings', 'public'))
      .then((snapshot) => {
        if (snapshot.exists())
          setSettings({ ...DEFAULT_SITE_SETTINGS, ...(snapshot.data() as Partial<SiteSettings>) })
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
