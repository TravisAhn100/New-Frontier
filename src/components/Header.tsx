import { Link } from 'react-router-dom'
import { formatPublicationDate, siteConfig } from '../data/siteConfig'
import type { EditionKey } from '../types/content'
import EditionSwitcher from './EditionSwitcher'
import SectionNavigation from './SectionNavigation'

interface HeaderProps {
  edition: EditionKey
}

export default function Header({ edition }: HeaderProps) {
  const config = siteConfig[edition]
  const now = new Date()

  return (
    <header className="site-header">
      <div className="header-top">
        <div className="header-top__inner page-width">
          <time dateTime={now.toISOString()}>{formatPublicationDate(edition, now)}</time>
          <EditionSwitcher edition={edition} />
        </div>
      </div>

      <div className="masthead-row page-width">
        <Link className="masthead-link" to={config.homePath} aria-label={`${config.publicationName} home`}>
          <img className="masthead-image" src={config.masthead} alt={config.mastheadAlt} />
        </Link>
      </div>

      <SectionNavigation edition={edition} />
    </header>
  )
}
