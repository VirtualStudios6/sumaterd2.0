import { HelmetProvider } from 'react-helmet-async'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './app/AuthProvider'
import { SiteSettingsProvider } from './app/SiteSettingsProvider'
import { router } from './app/router'
import { AdminProvider } from './features/admin/AdminProvider'

export function AppRoot() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <SiteSettingsProvider>
          <AdminProvider>
            <RouterProvider router={router} />
          </AdminProvider>
        </SiteSettingsProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}
