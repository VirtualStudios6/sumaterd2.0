import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Spinner } from '../components/Ui'
import { PublicLayout } from '../layouts/PublicLayout'

const HomePage = lazy(() => import('../pages/HomePage').then((m) => ({ default: m.HomePage })))
const CategoryPage = lazy(() =>
  import('../pages/CategoryPage').then((m) => ({ default: m.CategoryPage })),
)
const ForumPage = lazy(() => import('../pages/ForumPage').then((m) => ({ default: m.ForumPage })))
const ArticlePage = lazy(() =>
  import('../pages/ArticlePage').then((m) => ({ default: m.ArticlePage })),
)
const SearchPage = lazy(() =>
  import('../pages/SearchPage').then((m) => ({ default: m.SearchPage })),
)
const LoginPage = lazy(() => import('../pages/AuthPages').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() =>
  import('../pages/AuthPages').then((m) => ({ default: m.RegisterPage })),
)
const ResetPasswordPage = lazy(() =>
  import('../pages/AuthPages').then((m) => ({ default: m.ResetPasswordPage })),
)
const ProfilePage = lazy(() =>
  import('../pages/AuthPages').then((m) => ({ default: m.ProfilePage })),
)
const AboutPage = lazy(() => import('../pages/StaticPages').then((m) => ({ default: m.AboutPage })))
const PrivacyPage = lazy(() =>
  import('../pages/StaticPages').then((m) => ({ default: m.PrivacyPage })),
)
const ContactPage = lazy(() =>
  import('../pages/StaticPages').then((m) => ({ default: m.ContactPage })),
)
const NotFoundPage = lazy(() =>
  import('../pages/StaticPages').then((m) => ({ default: m.NotFoundPage })),
)
const AdminLayout = lazy(() =>
  import('../layouts/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const AdminLoginPage = lazy(() =>
  import('../pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })),
)
const DashboardPage = lazy(() =>
  import('../pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const ArticlesAdminPage = lazy(() =>
  import('../pages/admin/ArticlesAdminPage').then((m) => ({ default: m.ArticlesAdminPage })),
)
const ArticleEditorPage = lazy(() =>
  import('../pages/admin/ArticleEditorPage').then((m) => ({ default: m.ArticleEditorPage })),
)
const ArticlePreviewPage = lazy(() =>
  import('../pages/admin/ArticlePreviewPage').then((m) => ({ default: m.ArticlePreviewPage })),
)
const CarouselAdminPage = lazy(() =>
  import('../pages/admin/CarouselAdminPage').then((m) => ({ default: m.CarouselAdminPage })),
)
const SettingsPage = lazy(() =>
  import('../pages/admin/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
const ForumAdminPage = lazy(() =>
  import('../pages/admin/ForumAdminPage').then((m) => ({ default: m.ForumAdminPage })),
)
const UsersAdminPage = lazy(() =>
  import('../pages/admin/UsersAdminPage').then((m) => ({ default: m.UsersAdminPage })),
)
const ChangeInterestsAdminPage = lazy(() =>
  import('../pages/admin/ChangeInterestsAdminPage').then((m) => ({
    default: m.ChangeInterestsAdminPage,
  })),
)
const wait = (node: React.ReactNode) => (
  <Suspense
    fallback={
      <div className="container page">
        <Spinner />
      </div>
    }
  >
    {node}
  </Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: wait(<HomePage />) },
      { path: 'categoria/opinion', element: wait(<ForumPage />) },
      { path: 'categoria/politica', element: <Navigate to="/" replace /> },
      { path: 'categoria/actualidad', element: <Navigate to="/" replace /> },
      { path: 'categoria/cambio', element: <Navigate to="/" replace /> },
      { path: 'categoria/economia', element: <Navigate to="/" replace /> },
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
])
