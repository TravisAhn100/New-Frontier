import { Route, Routes } from 'react-router-dom'
import EditorialLayout from './components/EditorialLayout'
import Layout from './components/Layout'
import RequireEditorialAuth from './components/RequireEditorialAuth'
import ArticlePage from './pages/ArticlePage'
import ArticleEditorPage from './pages/ArticleEditorPage'
import ArticlePreviewPage from './pages/ArticlePreviewPage'
import EditorialArchivePage from './pages/EditorialArchivePage'
import EditorialArticlesPage from './pages/EditorialArticlesPage'
import EditorialHome from './pages/EditorialHome'
import Home from './pages/Home'
import LoginPage from './pages/LoginPage'
import SectionPage from './pages/SectionPage'
import type { EditionKey, SectionKey } from './types/content'

const sections: SectionKey[] = ['news', 'culture', 'opinion', 'school', 'info']

function editionRoutes(edition: EditionKey, prefix: string) {
  return (
    <Route path={prefix} element={<Layout />}>
      <Route index element={<Home edition={edition} />} />
      <Route path="article/:slug" element={<ArticlePage edition={edition} />} />
      {sections.map((section) => (
        <Route
          key={`${edition}-${section}`}
          path={section}
          element={<SectionPage edition={edition} section={section} />}
        />
      ))}
    </Route>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireEditorialAuth />}>
        <Route path="/edit/preview/:id" element={<ArticlePreviewPage />} />
        <Route path="/edit" element={<EditorialLayout />}>
          <Route index element={<EditorialHome />} />
          <Route path="new" element={<ArticleEditorPage />} />
          <Route path="article/:id" element={<ArticleEditorPage />} />
          <Route path="articles" element={<EditorialArticlesPage />} />
          <Route path="archive" element={<EditorialArchivePage />} />
        </Route>
      </Route>
      {editionRoutes('international', '/')}
      {editionRoutes('korean', '/ko')}
    </Routes>
  )
}
