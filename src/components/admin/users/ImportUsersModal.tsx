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
import { useImportUsers } from '#/hooks/useUsers'

interface ImportUsersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface CsvRow {
  email: string
  nombre: string
  rol: string
}

function parseCsvPreview(text: string): CsvRow[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const dataLines = lines[0]?.toLowerCase().startsWith('email') ? lines.slice(1) : lines
  return dataLines.slice(0, 5).map((line) => {
    const [email = '', nombre = '', rol = ''] = line.split(',').map((c) => c.trim())
    return { email, nombre, rol }
  })
}

export function ImportUsersModal({ open, onOpenChange }: ImportUsersModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<CsvRow[]>([])
  const importMutation = useImportUsers()

  const handleImport = async () => {
    if (!file) return
    await importMutation.mutateAsync(file)
    setFile(null)
    setPreview([])
    onOpenChange(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    setPreview([])
    if (!selected) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setPreview(parseCsvPreview(text))
    }
    reader.readAsText(selected)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setFile(null); setPreview([]) }; onOpenChange(o) }}>
      <DialogContent className="sm:max-w-[36rem] bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl text-red-900 dark:text-red-400">
            Importar Usuarios
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Sube un archivo CSV con el formato: email, nombre, rol
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl p-6 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <span className="text-2xl">📄</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {file ? file.name : 'Selecciona un archivo CSV'}
              </span>
            </label>
          </div>

          {preview.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                Vista previa ({preview.length} filas)
              </p>
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-700">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-zinc-800">
                    <tr>
                      {['Email', 'Nombre', 'Rol'].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                    {preview.map((row, i) => (
                      <tr key={i} className="bg-white dark:bg-zinc-900">
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{row.email}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{row.nombre}</td>
                        <td className="px-3 py-2">
                          <span className="rounded bg-primary-container/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                            {row.rol}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {file && preview.length === 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 p-3 rounded-lg">
              <p className="font-medium mb-1">Formato esperado:</p>
              <code className="text-gray-700 dark:text-gray-300">
                email,nombre,rol<br />
                juan@university.edu,Juan Perez,DOCENTE
              </code>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => { setFile(null); setPreview([]); onOpenChange(false) }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || importMutation.isPending}
            className="bg-red-900 text-white hover:bg-red-800"
          >
            {importMutation.isPending ? 'Importando...' : 'Importar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
