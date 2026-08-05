import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import SectionPage from './pages/SectionPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="news" element={<SectionPage section="News" />} />
          <Route path="culture" element={<SectionPage section="Culture" />} />
          <Route path="opinion" element={<SectionPage section="Opinion" />} />
          <Route path="school" element={<SectionPage section="School" />} />
          <Route path="info" element={<SectionPage section="Info" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
