const EDITORIAL_SESSION_KEY = 'nf_editor_authenticated'
const TEMPORARY_EDITORIAL_PASSWORD = 'NF2026'

export const authService = {
  isAuthenticated() {
    return sessionStorage.getItem(EDITORIAL_SESSION_KEY) === 'true'
  },

  login(password: string) {
    const authenticated = password === TEMPORARY_EDITORIAL_PASSWORD

    if (authenticated) {
      sessionStorage.setItem(EDITORIAL_SESSION_KEY, 'true')
    }

    return authenticated
  },

  logout() {
    sessionStorage.removeItem(EDITORIAL_SESSION_KEY)
  },
}
