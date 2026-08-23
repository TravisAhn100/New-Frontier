import { FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

interface LoginLocationState {
  from?: string
}

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (!await authService.login(password)) {
        setError('Password is incorrect.')
        return
      }

      const requestedPath = (location.state as LoginLocationState | null)?.from
      navigate(requestedPath?.startsWith('/edit') ? requestedPath : '/edit', { replace: true })
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to sign in. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <Link className="login-page__home" to="/">New Frontier</Link>
      <form className="login-panel" onSubmit={handleSubmit}>
        <header>
          <p>New Frontier</p>
          <h1>Editorial</h1>
        </header>
        <label htmlFor="editorial-password">Password</label>
        <input
          id="editorial-password"
          type="password"
          value={password}
          autoComplete="current-password"
          aria-describedby={error ? 'login-error' : undefined}
          onChange={(event) => {
            setPassword(event.target.value)
            setError('')
          }}
        />
        {error && <p className="login-panel__error" id="login-error" role="alert">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? 'Checking…' : 'Enter'}</button>
      </form>
    </main>
  )
}
