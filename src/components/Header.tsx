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
    <header>
      {/* Level 1 – top strip: date + edition tag */}
      <div className="header-top">
        <div className="container">
          <span className="header-top__date">{dateStr}</span>
          <span className="header-top__edition">International Edition</span>
        </div>
      </div>

      {/* Level 2 – masthead */}
      <div className="header-masthead">
        <img
          className="header-masthead__logo"
          src="/assets/new-frontier-header.svg"
          alt="New Frontier"
        />
        <p className="header-masthead__tagline">Student Journalism · International Edition</p>
      </div>

      {/* Level 3 – section navigation */}
      <nav className="header-nav" aria-label="Section navigation">
        <div className="container">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                'header-nav__link' + (isActive ? ' active' : '')
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  )
}
