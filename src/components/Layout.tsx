import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { siteConfig } from '../data/siteConfig'
import type { EditionKey } from '../types/content'
import Footer from './Footer'
import Header from './Header'

export default function Layout() {
  const { pathname } = useLocation()
  const edition: EditionKey = pathname === '/ko' || pathname.startsWith('/ko/')
    ? 'korean'
    : 'international'
  const config = siteConfig[edition]

  useEffect(() => {
    document.documentElement.lang = config.language
    document.title = `${config.publicationName} — ${config.editionLabel}`
  }, [config])

  return (
    <div className={`site-shell site-shell--${edition}`}>
      <Header edition={edition} />
      <main className="site-main">
        <div className="page-width">
          <Outlet />
        </div>
      </main>
      <Footer edition={edition} />
    </div>
  )
}
