import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'

/**
 * Modal genérico de importación CSV: ejemplo de formato siempre visible,
 * preview completa (5 filas fijas + resto con scroll) y confirmación explícita.
 */
export function CsvImportModal({
  open,
  onOpenChange,
  title,
  columns,
  exampleRows,
  helpText,
  onImport,
  pending = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** Cabeceras del CSV, en orden (ej: ['nombre', 'email', 'cupostutor']) */
  columns: string[]
  /** Filas de ejemplo mostradas siempre en el bloque de formato */
  exampleRows: string[]
  helpText?: string
  onImport: (file: File) => Promise<unknown>
  pending?: boolean
}) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string[][]>([])
  const [formatoInvalido, setFormatoInvalido] = useState(false)

  const parse = (text: string): string[][] => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
    const primera = lines[0]?.toLowerCase() ?? ''
    const dataLines = primera.includes(columns[0].toLowerCase()) ? lines.slice(1) : lines
    return dataLines.map((line) => line.split(',').map((c) => c.trim()))
  }

  const reset = () => {
    setFile(null)
    setPreview([])
    setFormatoInvalido(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    setPreview([])
    setFormatoInvalido(false)
    if (!selected) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const primeraLinea = (text.split('\n')[0] ?? '').toLowerCase()
      const coincideAlgunaColumna = columns.some((c) =>
        primeraLinea.includes(c.toLowerCase()),
      )
      setFormatoInvalido(!coincideAlgunaColumna)
      setPreview(parse(text))
    }
    reader.readAsText(selected)
  }

  const row = (cells: string[], i: number, dim = false) => (
    <tr key={i} className={dim ? 'bg-gray-50/50 dark:bg-zinc-800/50' : 'bg-white dark:bg-zinc-900'}>
      {columns.map((_, colIndex) => (
        <td key={colIndex} className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">
          {cells[colIndex] ?? ''}
        </td>
      ))}
    </tr>
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <DialogContent className="thin-scrollbar w-[calc(100%-2rem)] max-w-[38rem] max-h-[85vh] overflow-y-auto bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary">{title}</DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Sube un archivo CSV con el formato: {columns.join(',')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Ejemplo de formato, siempre visible */}
          <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500 dark:bg-zinc-800 dark:text-gray-400">
            <p className="mb-1 font-medium">Ejemplo:</p>
            <div className="overflow-x-auto">
              <code className="block whitespace-pre text-gray-700 dark:text-gray-300">
                {[columns.join(','), ...exampleRows].join('\n')}
              </code>
            </div>
            {helpText && <p className="mt-2">{helpText}</p>}
          </div>

          <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center dark:border-zinc-700">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id={`csv-upload-${title}`}
            />
            <label
              htmlFor={`csv-upload-${title}`}
              className="flex cursor-pointer flex-col items-center gap-2"
            >
              <span className="text-2xl">📄</span>
              <span className="max-w-full truncate text-sm text-gray-600 dark:text-gray-400">
                {file ? file.name : 'Selecciona un archivo CSV'}
              </span>
            </label>
          </div>

          {formatoInvalido && (
            <p className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
              Este archivo no coincide con el formato esperado ({columns.join(',')}).
              Verifica que subiste el CSV correcto.
            </p>
          )}

          {preview.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Vista previa — {preview.length} {preview.length === 1 ? 'registro' : 'registros'}
              </p>
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-700">
                <table className="w-full min-w-max text-xs">
                  <thead className="bg-gray-50 dark:bg-zinc-800">
                    <tr>
                      {columns.map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap px-3 py-2 text-left font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                    {preview.slice(0, 5).map((cells, i) => row(cells, i))}
                  </tbody>
                </table>
                {preview.length > 5 && (
                  <div className="max-h-[160px] overflow-y-auto border-t border-gray-200 dark:border-zinc-700">
                    <table className="w-full min-w-max text-xs">
                      <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                        {preview.slice(5).map((cells, i) => row(cells, i + 5, true))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset()
              onOpenChange(false)
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              if (!file) return
              await onImport(file)
              reset()
              onOpenChange(false)
            }}
            disabled={!file || pending || formatoInvalido}
            className="bg-primary text-[#fff] hover:brightness-110"
          >
            {pending ? 'Importando…' : 'Importar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
