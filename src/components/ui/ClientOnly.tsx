import { useEffect, useState } from 'react'

/** Renderiza children solo en el cliente (para recharts/pdf.js con SSR). */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted ? children : fallback
}
