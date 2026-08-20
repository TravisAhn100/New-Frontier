import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import SectionPage from './pages/SectionPage'
import type { EditionKey, SectionKey } from './types/content'

const sections: SectionKey[] = ['news', 'culture', 'opinion', 'school', 'info']

function editionRoutes(edition: EditionKey, prefix: string) {
  return (
    <Route path={prefix} element={<Layout />}>
      <Route index element={<Home edition={edition} />} />
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
      {editionRoutes('international', '/')}
      {editionRoutes('korean', '/ko')}
    </Routes>
  )
}
