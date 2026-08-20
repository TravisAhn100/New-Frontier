import { NavLink } from 'react-router-dom'
import { getSectionPath, sectionOrder, siteConfig } from '../data/siteConfig'
import type { EditionKey } from '../types/content'

interface SectionNavigationProps {
  edition: EditionKey
}

export default function SectionNavigation({ edition }: SectionNavigationProps) {
  const config = siteConfig[edition]

  return (
    <nav className="section-navigation" aria-label={`${config.editionLabel} edition sections`}>
      <div className="section-navigation__inner page-width">
        {sectionOrder.map((section) => (
          <NavLink
            key={section}
            to={getSectionPath(edition, section)}
            className={({ isActive }) =>
              `section-navigation__link${isActive ? ' is-active' : ''}`
            }
          >
            {config.navigation[section]}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
