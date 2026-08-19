import { lazy, Suspense, useEffect, useState, type ComponentType } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PageTransitionSplash } from '../components/PageTransitionSplash'
import { PublicLayout } from '../layouts/PublicLayout'

const SPLASH_THRESHOLD_MS = 400
const SPLASH_VISIBLE_MS = 3000

function lazyPage<T extends ComponentType>(loader: () => Promise<{ default: T }>) {
  return lazy(async () => {
    const startedAt = Date.now()
    const loaded = await loader()
    const elapsed = Date.now() - startedAt

    if (elapsed >= SPLASH_THRESHOLD_MS) {
      const remainingVisibleTime = SPLASH_THRESHOLD_MS + SPLASH_VISIBLE_MS - elapsed
      if (remainingVisibleTime > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingVisibleTime))
      }
    }

    return loaded
  })
}

function RouteLoadingFallback() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), SPLASH_THRESHOLD_MS)
    return () => window.clearTimeout(timer)
  }, [])

  return visible ? <PageTransitionSplash /> : null
}

const HomePage = lazyPage(() => import('../pages/HomePage').then((m) => ({ default: m.HomePage })))
const CategoryPage = lazyPage(() =>
  import('../pages/CategoryPage').then((m) => ({ default: m.CategoryPage })),
)
const ForumPage = lazyPage(() =>
  import('../pages/ForumPage').then((m) => ({ default: m.ForumPage })),
)
const ChangePage = lazyPage(() =>
  import('../pages/ChangePage').then((m) => ({ default: m.ChangePage })),
)
const ArticlePage = lazyPage(() =>
  import('../pages/ArticlePage').then((m) => ({ default: m.ArticlePage })),
)
const SearchPage = lazyPage(() =>
  import('../pages/SearchPage').then((m) => ({ default: m.SearchPage })),
)
const LoginPage = lazyPage(() =>
  import('../pages/AuthPages').then((m) => ({ default: m.LoginPage })),
)
const RegisterPage = lazyPage(() =>
  import('../pages/AuthPages').then((m) => ({ default: m.RegisterPage })),
)
const ResetPasswordPage = lazyPage(() =>
  import('../pages/AuthPages').then((m) => ({ default: m.ResetPasswordPage })),
)
const ProfilePage = lazyPage(() =>
  import('../pages/AuthPages').then((m) => ({ default: m.ProfilePage })),
)
const AboutPage = lazyPage(() =>
  import('../pages/StaticPages').then((m) => ({ default: m.AboutPage })),
)
const PrivacyPage = lazyPage(() =>
  import('../pages/StaticPages').then((m) => ({ default: m.PrivacyPage })),
)
const ContactPage = lazyPage(() =>
  import('../pages/StaticPages').then((m) => ({ default: m.ContactPage })),
)
const NotFoundPage = lazyPage(() =>
  import('../pages/StaticPages').then((m) => ({ default: m.NotFoundPage })),
)
const AdminLayout = lazyPage(() =>
  import('../layouts/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const AdminLoginPage = lazyPage(() =>
  import('../pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })),
)
const DashboardPage = lazyPage(() =>
  import('../pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const ArticlesAdminPage = lazyPage(() =>
  import('../pages/admin/ArticlesAdminPage').then((m) => ({ default: m.ArticlesAdminPage })),
)
const ArticleEditorPage = lazyPage(() =>
  import('../pages/admin/ArticleEditorPage').then((m) => ({ default: m.ArticleEditorPage })),
)
const ArticlePreviewPage = lazyPage(() =>
  import('../pages/admin/ArticlePreviewPage').then((m) => ({ default: m.ArticlePreviewPage })),
)
const CarouselAdminPage = lazyPage(() =>
  import('../pages/admin/CarouselAdminPage').then((m) => ({ default: m.CarouselAdminPage })),
)
const SettingsPage = lazyPage(() =>
  import('../pages/admin/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
const ForumAdminPage = lazyPage(() =>
  import('../pages/admin/ForumAdminPage').then((m) => ({ default: m.ForumAdminPage })),
)
const UsersAdminPage = lazyPage(() =>
  import('../pages/admin/UsersAdminPage').then((m) => ({ default: m.UsersAdminPage })),
)
const ChangeInterestsAdminPage = lazyPage(() =>
  import('../pages/admin/ChangeInterestsAdminPage').then((m) => ({
    default: m.ChangeInterestsAdminPage,
  })),
)
const wait = (node: React.ReactNode) => (
  <Suspense fallback={<RouteLoadingFallback />}>{node}</Suspense>
)

const routes = [
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: wait(<HomePage />) },
      { path: 'categoria/opinion', element: wait(<ForumPage />) },
      { path: 'categoria/politica', element: <Navigate to="/" replace /> },
      { path: 'categoria/actualidad', element: <Navigate to="/" replace /> },
      { path: 'categoria/cambio', element: wait(<ChangePage />) },
      { path: 'categoria/economia', element: <Navigate to="/categoria/cambio" replace /> },
      { path: 'categoria/:slug', element: wait(<CategoryPage />) },
      { path: 'articulo/:slug', element: wait(<ArticlePage />) },
      { path: 'buscar', element: wait(<SearchPage />) },
      { path: 'login', element: wait(<LoginPage />) },
      { path: 'registro', element: wait(<RegisterPage />) },
      { path: 'recuperar-contrasena', element: wait(<ResetPasswordPage />) },
      { path: 'perfil', element: wait(<ProfilePage />) },
      { path: 'sobre-nosotros', element: wait(<AboutPage />) },
      { path: 'privacidad', element: wait(<PrivacyPage />) },
      { path: 'contacto', element: wait(<ContactPage />) },
      { path: '*', element: wait(<NotFoundPage />) },
    ],
  },
  { path: '/admin/login', element: wait(<AdminLoginPage />) },
  {
    path: '/admin',
    element: wait(<AdminLayout />),
    children: [
      { index: true, element: wait(<DashboardPage />) },
      { path: 'articles', element: wait(<ArticlesAdminPage />) },
      { path: 'articles/new', element: wait(<ArticleEditorPage />) },
      { path: 'articles/:id/edit', element: wait(<ArticleEditorPage />) },
      { path: 'articles/:id/preview', element: wait(<ArticlePreviewPage />) },
      { path: 'carousel', element: wait(<CarouselAdminPage />) },
      { path: 'forum', element: wait(<ForumAdminPage />) },
      { path: 'users', element: wait(<UsersAdminPage />) },
      { path: 'change', element: wait(<ChangeInterestsAdminPage />) },
      { path: 'settings', element: wait(<SettingsPage />) },
    ],
  },
] satisfies Parameters<typeof createBrowserRouter>[0]

const routerBase = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export const router = createBrowserRouter(routes, { basename: routerBase })
