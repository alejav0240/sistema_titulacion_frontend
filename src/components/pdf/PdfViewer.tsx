import { Suspense, lazy, useEffect, useState } from 'react'
import type { ComponentProps } from 'react'

const PdfDocumentView = lazy(() => import('./PdfDocumentView'))

type Props = ComponentProps<typeof PdfDocumentView>

/** Wrapper client-only: pdf.js necesita DOM y no puede ejecutarse en SSR. */
export function PdfViewer(props: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const fallback = (
    <div className="flex flex-1 items-center justify-center text-body-sm text-outline">
      Cargando visor…
    </div>
  )

  if (!mounted) return fallback

  return (
    <Suspense fallback={fallback}>
      <PdfDocumentView {...props} />
    </Suspense>
  )
}
