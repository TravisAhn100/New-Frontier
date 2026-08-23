import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'

export default function RequireEditorialAuth() {
  const location = useLocation()
  const [authenticated, setAuthenticated] = useState<boolean>()

  useEffect(() => {
    let active = true
    void authService.isAuthenticated().then((result) => {
      if (active) setAuthenticated(result)
    })
    return () => {
      active = false
    }
  }, [location.pathname])

  if (authenticated === undefined) {
    return <main className="editorial-auth-loading">Checking editorial access…</main>
  }

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
