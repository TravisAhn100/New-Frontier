import { Link, Outlet, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

export default function EditorialLayout() {
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await authService.logout()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="editorial-shell">
      <header className="editorial-header">
        <Link className="editorial-brand" to="/edit">
          <span>New Frontier</span>
          <small>Editorial</small>
        </Link>
        <nav aria-label="Editorial navigation">
          <Link to="/edit/new">Write</Link>
          <Link to="/edit/articles">Edit</Link>
          <Link to="/edit/archive">Archive</Link>
          <Link to="/">View publication</Link>
          <button type="button" onClick={() => void handleLogout()}>Log out</button>
        </nav>
      </header>
      <main className="editorial-main">
        <Outlet />
      </main>
    </div>
  )
}
