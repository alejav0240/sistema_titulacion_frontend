import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useCallback, useRef } from 'react'
import api from '#/lib/api'
import type {
  CategoriaNotificacion,
  NotificacionesResponse,
} from '#/types/notification'

export function useNotifications(filters?: {
  categoria?: CategoriaNotificacion | ''
  leido?: boolean
  page?: number
  enviadas?: boolean
}) {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: async () => {
      const params: Record<string, string | number | boolean> = {}
      if (filters?.categoria) params.categoria = filters.categoria
      if (filters?.leido !== undefined) params.leido = filters.leido
      if (filters?.page) params.page = filters.page
      if (filters?.enviadas) params.enviadas = 'true'
      const { data } = await api.get<NotificacionesResponse>(
        '/api/notifications/',
        { params },
      )
      return data
    },
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      const { data } = await api.get<{ count: number }>(
        '/api/notifications/unread-count/',
      )
      return data.count
    },
    refetchInterval: 30_000,
    retry: false,
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/api/notifications/${id}/read/`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    },
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.post('/api/notifications/read-all/')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    },
  })
}

/**
 * Marca una notificación como leída cuando su elemento entra al viewport
 * del contenedor con scroll (no el viewport de la página) — un ítem fuera
 * de vista por `overflow-y: auto/scroll` simplemente no intersecta y no se
 * marca, sin lógica manual de scroll.
 *
 * Uso: `ref={setContainer}` en el div con overflow-y, y
 * `ref={registerItem} data-notification-id={n.id}` en cada ítem no leído.
 */
export function useMarkReadOnVisible() {
  const markRead = useMarkRead()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const markedRef = useRef(new Set<number>())
  const pendingElsRef = useRef<HTMLElement[]>([])
  const markReadRef = useRef(markRead)
  markReadRef.current = markRead

  const onIntersect: IntersectionObserverCallback = (entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      const id = Number((entry.target as HTMLElement).dataset.notificationId)
      if (!id || markedRef.current.has(id)) continue
      markedRef.current.add(id)
      markReadRef.current.mutate(id)
      observer.unobserve(entry.target)
    }
  }

  const setContainer = useCallback((root: HTMLElement | null) => {
    observerRef.current?.disconnect()
    observerRef.current = null
    if (!root) return
    const observer = new IntersectionObserver(onIntersect, { root, threshold: 0.6 })
    observerRef.current = observer
    for (const el of pendingElsRef.current) observer.observe(el)
    pendingElsRef.current = []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const registerItem = useCallback((el: HTMLElement | null) => {
    if (!el) return
    if (observerRef.current) observerRef.current.observe(el)
    else pendingElsRef.current.push(el)
  }, [])

  return { setContainer, registerItem }
}

export function useSendNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      destinatarios: number[]
      titulo: string
      mensaje: string
      prioridad?: string
    }) => {
      const { data } = await api.post('/api/notifications/send/', payload)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
