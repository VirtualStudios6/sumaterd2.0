import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/nunito-sans'
import { registerSW } from 'virtual:pwa-register'
import './styles.css'

const requiredFirebaseValues = [
  import.meta.env.VITE_FIREBASE_API_KEY,
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  import.meta.env.VITE_FIREBASE_PROJECT_ID,
  import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  import.meta.env.VITE_FIREBASE_APP_ID,
]
const firebaseReady = requiredFirebaseValues.every(
  (value) => value && !String(value).startsWith('replace-with-'),
)
const root = ReactDOM.createRoot(document.getElementById('root')!)

if (!firebaseReady) {
  root.render(
    <React.StrictMode>
      <main className="configuration-error">
        <div>
          <span>Configuración requerida</span>
          <h1>No se pudo iniciar SumateRD</h1>
          <p>
            Falta la configuración pública de Firebase. Completa el archivo <code>.env</code> y
            reinicia el servidor de desarrollo.
          </p>
        </div>
      </main>
    </React.StrictMode>,
  )
} else {
  registerSW({ immediate: true })
  void import('./AppRoot').then(({ AppRoot }) => {
    root.render(
      <React.StrictMode>
        <AppRoot />
      </React.StrictMode>,
    )
  })
}
