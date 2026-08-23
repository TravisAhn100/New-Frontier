import { apiRequest, ApiError } from './apiClient'

interface AuthState {
  authenticated: boolean
}

const AUTH_CHANGED_EVENT = 'nf-auth-changed'

function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

export const authService = {
  eventName: AUTH_CHANGED_EVENT,

  async isAuthenticated() {
    try {
      const state = await apiRequest<AuthState>('/api/auth/session')
      return state.authenticated
    } catch {
      return false
    }
  },

  async login(password: string) {
    try {
      const state = await apiRequest<AuthState>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      })
      notifyAuthChanged()
      return state.authenticated
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return false
      throw error
    }
  },

  async logout() {
    await apiRequest<AuthState>('/api/auth/logout', { method: 'POST' })
    notifyAuthChanged()
  },
}
