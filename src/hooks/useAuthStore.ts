import { Store } from '@tanstack/react-store'

interface AuthState {
  user: { id: number; email: string; nombre: string; rol: string } | null
  isAuthenticated: boolean
}

const STORAGE_KEY = 'auth_user'

export const authStore = new Store<AuthState>({
  user: null,
  isAuthenticated: false,
})

export function setAuth(user: AuthState['user'], remember = false) {
  authStore.setState(() => ({ user, isAuthenticated: true }))
  if (typeof window === 'undefined') return
  // Con "recordar sesión" persiste entre cierres del navegador (localStorage);
  // si no, solo dura la pestaña actual (sessionStorage).
  const primary = remember ? window.localStorage : window.sessionStorage
  const secondary = remember ? window.sessionStorage : window.localStorage
  primary.setItem(STORAGE_KEY, JSON.stringify(user))
  secondary.removeItem(STORAGE_KEY)
}

export function clearAuth() {
  authStore.setState(() => ({ user: null, isAuthenticated: false }))
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
  window.sessionStorage.removeItem(STORAGE_KEY)
}

export function initAuth() {
  if (typeof window === 'undefined') return
  const stored =
    window.localStorage.getItem(STORAGE_KEY) ??
    window.sessionStorage.getItem(STORAGE_KEY)
  if (!stored) return
  try {
    authStore.setState(() => ({
      user: JSON.parse(stored),
      isAuthenticated: true,
    }))
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    window.sessionStorage.removeItem(STORAGE_KEY)
  }
}
