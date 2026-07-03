import { CsvImportModal } from '#/components/ui/CsvImportModal'
import { useImportUsers } from '#/hooks/useUsers'

export function ImportUsersModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const importMutation = useImportUsers()

  return (
    <CsvImportModal
      open={open}
      onOpenChange={onOpenChange}
      title="Importar Docentes"
      columns={['nombre', 'email', 'cupostutor', 'cupostribunal']}
      exampleRows={[
        'Juan Perez,juan@university.edu,5,3',
        'Ana Lopez,ana@university.edu,0,0',
      ]}
      helpText="Los cupos en 0 significan sin límite. El rol asignado será DOCENTE."
      onImport={(file) => importMutation.mutateAsync(file)}
      pending={importMutation.isPending}
    />
  )
}
