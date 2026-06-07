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

export function ImportUsersModal({ open, onOpenChange }: ImportUsersModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const importMutation = useImportUsers()

  const handleImport = async () => {
    if (!file) return
    await importMutation.mutateAsync(file)
    setFile(null)
    onOpenChange(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl text-red-900 dark:text-red-400">
            Importar Usuarios
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Sube un archivo CSV con el formato: email, nombre, rol
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl p-8 text-center">
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

          {file && (
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
            onClick={() => {
              setFile(null)
              onOpenChange(false)
            }}
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
