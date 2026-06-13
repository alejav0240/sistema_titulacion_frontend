import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown | null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(undefined)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Un 401 del propio login (credenciales) o del refresh no debe disparar
      // otro intento de refresh; se rechaza para que el formulario muestre el error.
      if (originalRequest.url?.includes('/api/login')) {
        if (
          originalRequest.url?.includes('/api/login/refresh') &&
          !window.location.pathname.includes('/auth/login')
        ) {
          window.location.href = '/auth/login'
        }
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await api.post('/api/login/refresh/')
        processQueue(null)
        return api(originalRequest)
      } catch {
        processQueue(error)
        if (!window.location.pathname.includes('/auth/login')) {
          window.location.href = '/auth/login'
        }
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api
