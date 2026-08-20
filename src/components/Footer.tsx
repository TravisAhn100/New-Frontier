import { Link } from 'react-router-dom'
import { siteConfig } from '../data/siteConfig'
import type { EditionKey } from '../types/content'

interface FooterProps {
  edition: EditionKey
}

export default function Footer({ edition }: FooterProps) {
  const config = siteConfig[edition]

  return (
    <footer className="site-footer">
      <div className="site-footer__inner page-width">
        <Link to={config.homePath}>{config.publicationName}</Link>
        <span>{config.editionLabel} edition</span>
      </div>
    </footer>
  )
}
