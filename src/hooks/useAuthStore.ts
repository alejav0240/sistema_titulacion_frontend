import { Store } from '@tanstack/react-store'

interface AuthState {
  user: { id: number; email: string; name: string; rol: string } | null
  isAuthenticated: boolean
}

export const authStore = new Store<AuthState>({
  user: null,
  isAuthenticated: false,
})

export function setAuth(user: AuthState['user']) {
  authStore.setState(() => ({ user, isAuthenticated: true }))
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('auth_user', JSON.stringify(user))
  }
}

export function clearAuth() {
  authStore.setState(() => ({ user: null, isAuthenticated: false }))
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('auth_user')
  }
}

export function initAuth() {
  if (typeof sessionStorage === 'undefined') return
  const stored = sessionStorage.getItem('auth_user')
  if (stored) {
    authStore.setState(() => ({
      user: JSON.parse(stored),
      isAuthenticated: true,
    }))
  }
}
