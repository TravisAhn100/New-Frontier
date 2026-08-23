import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ArticlesProvider } from './context/ArticlesContext'
import './editorial.css'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ArticlesProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ArticlesProvider>
  </StrictMode>,
)
