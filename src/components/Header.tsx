import { NavLink } from 'react-router-dom'
import { useKSTDate } from '../hooks/useKSTDate'

const NAV_LINKS = [
  { to: '/news',    label: 'News' },
  { to: '/culture', label: 'Culture' },
  { to: '/opinion', label: 'Opinion' },
  { to: '/school',  label: 'School' },
  { to: '/info',    label: 'Info' },
]

export default function Header() {
  const dateStr = useKSTDate()

  return (
    <header className="site-header">
      {/* Level 1 – top strip: date + edition switcher */}
      <div className="header-top">
        <div className="container header-top__inner">
          <span className="header-top__date">{dateStr.toUpperCase()}</span>
          <span className="header-top__edition">INTERNATIONAL / KOREAN</span>
        </div>
      </div>

      {/* Level 2 – masthead with real SVG logo */}
      <div className="header-masthead">
        <img
          className="header-masthead__logo"
          src="/assets/new-frontier-header-white.svg"
          alt="New Frontier"
        />
      </div>

      {/* Level 3 – section navigation */}
      <nav className="header-nav" aria-label="Section navigation">
        <div className="container header-nav__inner">
          {NAV_LINKS.map(({ to, label }, i) => (
            <span key={to} className="header-nav__item">
              {i > 0 && <span className="header-nav__divider" aria-hidden="true" />}
              <NavLink
                to={to}
                className={({ isActive }) =>
                  'header-nav__link' + (isActive ? ' active' : '')
                }
              >
                {label}
              </NavLink>
            </span>
          ))}
        </div>
      </nav>
    </header>
  )
}
