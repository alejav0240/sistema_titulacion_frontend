import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { cn } from '#/lib/utils'
import type { Anotacion, RectNormalizado } from '#/types/annotation'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export interface DraftRect extends RectNormalizado {
  /** Posición en píxeles dentro del contenedor de la página (para el popover) */
  pixel: { left: number; top: number; width: number; height: number }
}

function rectStyle(rect: {
  x: number
  y: number
  ancho: number
  alto: number
}): React.CSSProperties {
  return {
    left: `${rect.x * 100}%`,
    top: `${rect.y * 100}%`,
    width: `${rect.ancho * 100}%`,
    height: `${rect.alto * 100}%`,
  }
}

export default function PdfDocumentView({
  fileUrl,
  pageNumber,
  scale,
  annotations,
  selectedId,
  onSelect,
  drawMode = false,
  onDrawComplete,
  onLoaded,
  className,
}: {
  fileUrl: string
  pageNumber: number
  scale: number
  annotations: Anotacion[]
  selectedId?: number | null
  onSelect?: (id: number) => void
  drawMode?: boolean
  onDrawComplete?: (draft: DraftRect) => void
  onLoaded?: (numPages: number) => void
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const file = useMemo(
    () => ({ url: fileUrl, withCredentials: true }),
    [fileUrl],
  )
  const [drawing, setDrawing] = useState<{
    startX: number
    startY: number
    x: number
    y: number
    w: number
    h: number
  } | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width
      if (width) setContainerWidth(width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const pageWidth = containerWidth ? Math.min(containerWidth - 16, 900) * scale : undefined

  const relativePoint = useCallback((e: React.MouseEvent) => {
    const el = pageRef.current
    if (!el) return null
    const bounds = el.getBoundingClientRect()
    return {
      px: e.clientX - bounds.left,
      py: e.clientY - bounds.top,
      w: bounds.width,
      h: bounds.height,
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!drawMode) return
    const point = relativePoint(e)
    if (!point) return
    e.preventDefault()
    setDrawing({
      startX: point.px,
      startY: point.py,
      x: point.px,
      y: point.py,
      w: 0,
      h: 0,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawMode || !drawing) return
    const point = relativePoint(e)
    if (!point) return
    setDrawing({
      ...drawing,
      x: Math.min(drawing.startX, point.px),
      y: Math.min(drawing.startY, point.py),
      w: Math.abs(point.px - drawing.startX),
      h: Math.abs(point.py - drawing.startY),
    })
  }

  const handleMouseUp = () => {
    if (!drawMode || !drawing) return
    const el = pageRef.current
    setDrawing(null)
    if (!el || drawing.w < 8 || drawing.h < 8) return
    const bounds = el.getBoundingClientRect()
    onDrawComplete?.({
      pagina: pageNumber,
      x: drawing.x / bounds.width,
      y: drawing.y / bounds.height,
      ancho: drawing.w / bounds.width,
      alto: drawing.h / bounds.height,
      pixel: {
        left: drawing.x,
        top: drawing.y,
        width: drawing.w,
        height: drawing.h,
      },
    })
  }

  const pageAnnotations = annotations.filter(
    (a) => a.nota_observacion && a.nota_observacion.pagina === pageNumber,
  )

  return (
    <div
      ref={containerRef}
      className={cn(
        'thin-scrollbar flex flex-1 flex-col items-center overflow-auto p-lg',
        className,
      )}
    >
      <Document
        file={file}
        loading={
          <div className="flex h-96 items-center justify-center text-body-sm text-outline">
            Cargando documento…
          </div>
        }
        error={
          <div className="mx-auto mt-xl max-w-[28rem] rounded-xl bg-error-container p-lg text-center text-body-sm text-on-error-container">
            No se pudo cargar el PDF. Verifica que el link de Google Drive esté
            compartido como «Cualquier persona con el enlace».
          </div>
        }
        onLoadSuccess={({ numPages }) => onLoaded?.(numPages)}
      >
        <div
          ref={pageRef}
          className={cn(
            'relative bg-white shadow-lg',
            drawMode && 'cursor-crosshair',
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setDrawing(null)}
        >
          <Page
            pageNumber={pageNumber}
            width={pageWidth}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />

          {/* Overlay de anotaciones (coords normalizadas 0-1) */}
          {pageAnnotations.map((a) => {
            const nota = a.nota_observacion!
            const pendiente = a.estado === 'PENDIENTE'
            return (
              <button
                key={a.id}
                type="button"
                title={`${a.codigo_display}: ${nota.comentario}`}
                onClick={() => onSelect?.(a.id)}
                className={cn(
                  'absolute rounded-[2px] transition-all',
                  pendiente
                    ? 'border-b-2 border-[#FFD700] bg-[rgba(255,222,0,0.3)] hover:bg-[rgba(255,222,0,0.45)]'
                    : 'border-b-2 border-[#22c55e] bg-[rgba(34,197,94,0.3)] hover:bg-[rgba(34,197,94,0.45)]',
                  selectedId === a.id &&
                    'ring-2 ring-primary-container ring-offset-1',
                )}
                style={rectStyle({
                  x: Number(nota.x),
                  y: Number(nota.y),
                  ancho: Number(nota.ancho),
                  alto: Number(nota.alto),
                })}
              >
                <span className="absolute -top-5 left-0 rounded bg-primary-container px-xs text-[9px] font-bold text-on-primary">
                  {a.codigo_display}
                </span>
              </button>
            )
          })}

          {/* Rect en curso de dibujo */}
          {drawing && drawing.w > 0 && (
            <div
              className="pointer-events-none absolute border-2 border-dashed border-primary-container bg-primary-container/10"
              style={{
                left: drawing.x,
                top: drawing.y,
                width: drawing.w,
                height: drawing.h,
              }}
            />
          )}
        </div>
      </Document>
    </div>
  )
}
