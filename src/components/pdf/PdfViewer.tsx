import { Suspense, lazy, useEffect, useState } from 'react'
import type { ComponentProps } from 'react'
import api from '#/lib/api'

const PdfDocumentView = lazy(() => import('./PdfDocumentView'))

type Props = ComponentProps<typeof PdfDocumentView>

const GENERIC_ERROR =
  'No se pudo cargar el PDF. Verifica que el enlace de Google Drive sea público.'

/** Lee el mensaje real del backend, incluso cuando la respuesta vino como Blob. */
async function extractError(err: unknown): Promise<string> {
  const data = (err as { response?: { data?: unknown } })?.response?.data
  try {
    if (data instanceof Blob) {
      const parsed = JSON.parse(await data.text())
      if (parsed?.detail) return String(parsed.detail)
    } else if (data && typeof data === 'object' && 'detail' in data) {
      return String((data as { detail: unknown }).detail)
    }
  } catch {
    // sin detail legible → mensaje genérico
  }
  return GENERIC_ERROR
}

/**
 * Wrapper client-only: descarga el PDF vía axios (pasa por el refresh de token y
 * expone el error real del proxy) y se lo entrega a pdf.js como object URL.
 * pdf.js necesita DOM y no puede ejecutarse en SSR.
 */
export function PdfViewer({ fileUrl, ...docProps }: Props) {
  const [mounted, setMounted] = useState(false)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    let cancelled = false
    let createdUrl: string | null = null
    setError(null)
    setObjectUrl(null)

    api
      .get(fileUrl, { responseType: 'blob' })
      .then((res) => {
        if (cancelled) return
        createdUrl = URL.createObjectURL(res.data)
        setObjectUrl(createdUrl)
      })
      .catch(async (err) => {
        const message = await extractError(err)
        if (!cancelled) setError(message)
      })

    return () => {
      cancelled = true
      if (createdUrl) URL.revokeObjectURL(createdUrl)
    }
  }, [fileUrl])

  const loading = (
    <div className="flex flex-1 items-center justify-center text-body-sm text-outline">
      Cargando visor…
    </div>
  )

  if (!mounted) return loading

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-lg">
        <div className="mx-auto max-w-[28rem] rounded-xl bg-error-container p-lg text-center text-body-sm text-on-error-container">
          {error}
        </div>
      </div>
    )
  }

  if (!objectUrl) return loading

  return (
    <Suspense fallback={loading}>
      <PdfDocumentView {...docProps} fileUrl={objectUrl} />
    </Suspense>
  )
}
