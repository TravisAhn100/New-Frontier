import { NavLink } from 'react-router-dom'
import type { EditionKey } from '../types/content'

interface EditionSwitcherProps {
  edition: EditionKey
}

export default function EditionSwitcher({ edition }: EditionSwitcherProps) {
  return (
    <nav className="edition-switcher" aria-label="Choose edition">
      <NavLink
        to="/"
        end
        aria-current={edition === 'international' ? 'page' : undefined}
        className={edition === 'international' ? 'is-active' : undefined}
      >
        International
      </NavLink>
      <span aria-hidden="true">/</span>
      <NavLink
        to="/ko"
        end
        aria-current={edition === 'korean' ? 'page' : undefined}
        className={edition === 'korean' ? 'is-active' : undefined}
      >
        Korean
      </NavLink>
    </nav>
  )
}
