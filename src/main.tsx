import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/nunito-sans'
import { HelmetProvider } from 'react-helmet-async'
import { RouterProvider } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import { AdminProvider } from './features/admin/AdminProvider'
import { AuthProvider } from './app/AuthProvider'
import { SiteSettingsProvider } from './app/SiteSettingsProvider'
import { router } from './app/router'
import './styles.css'

registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <SiteSettingsProvider>
          <AdminProvider>
            <RouterProvider router={router} />
          </AdminProvider>
        </SiteSettingsProvider>
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
