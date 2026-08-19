import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { PageTransitionSplash } from '../components/PageTransitionSplash'
export function PublicLayout() {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido">
        <Outlet />
      </main>
      <Footer />
      <PageTransitionSplash />
      <ScrollRestoration />
    </>
  )
}
