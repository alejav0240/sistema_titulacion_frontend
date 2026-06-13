import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Checkbox } from '#/components/ui/checkbox'
import type { Rol, Usuario } from '#/types/user'
import { useCreateUser, useUpdateUser } from '#/hooks/useUsers'

const userSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email('Email invalido'),
  rol: z.enum([
    'DOCENTE',
    'TRIBUNAL',
    'TUTOR',
    'ESTUDIANTE',
    'DIRECTOR',
    'DTC',
  ]),
  subroles: z.array(z.string()).optional(),
  sendEmail: z.boolean().optional(),
})

type UserFormData = z.infer<typeof userSchema>

interface UserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: Usuario | null
}

export function UserModal({ open, onOpenChange, user }: UserModalProps) {
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const isEditing = !!user

  const form = useForm({
    defaultValues: {
      nombre: '',
      email: '',
      rol: 'ESTUDIANTE',
      subroles: [],
      sendEmail: true,
    } as UserFormData,
    validators: {
      onChange: userSchema,
    },
    onSubmit: async ({ value }) => {
      if (isEditing && user) {
        await updateMutation.mutateAsync({
          id: user.id,
          nombre: value.nombre,
          email: value.email,
          rol: value.rol,
          capacidades,
        })
      } else {
        const creado = await createMutation.mutateAsync({
          nombre: value.nombre,
          email: value.email,
          rol: value.rol,
          capacidades,
          sendEmail: value.sendEmail,
        })
        if (value.sendEmail && creado.email_enviado === false) {
          toast.warning(
            'El usuario se creó, pero el email con las credenciales no pudo enviarse.',
          )
        }
        if (creado.generated_password) {
          // La contraseña solo viaja una vez: mostrarla antes de cerrar.
          setGeneratedPassword(creado.generated_password)
          setSelectedRol('ESTUDIANTE')
          setCapacidades([])
          form.reset()
          return
        }
        toast.success('Usuario creado correctamente.')
      }
      onOpenChange(false)
      setSelectedRol('ESTUDIANTE')
      setCapacidades([])
      form.reset()
    },
  })

  const [selectedRol, setSelectedRol] = useState<Rol>('ESTUDIANTE')
  const [capacidades, setCapacidades] = useState<string[]>([])
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  )

  useEffect(() => {
    setGeneratedPassword(null)
    if (isEditing && user) {
      form.setFieldValue('nombre', user.nombre)
      form.setFieldValue('email', user.email)
      form.setFieldValue('rol', user.rol)
      setSelectedRol(user.rol)
      setCapacidades(user.capacidades ?? [])
    } else {
      form.reset()
      setSelectedRol('ESTUDIANTE')
      setCapacidades([])
    }
  }, [user, isEditing, open])

  const toggleCapacidad = (value: string) =>
    setCapacidades((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value],
    )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl text-red-900 dark:text-red-400">
            {isEditing ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            {isEditing
              ? 'Modifica la informacion del usuario seleccionado.'
              : 'Completa la informacion para dar de alta un nuevo miembro en la plataforma. La contrasena se generara automaticamente.'}
          </DialogDescription>
        </DialogHeader>

        {generatedPassword && (
          <div className="space-y-4 py-4">
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
              <p className="mb-2 text-sm font-bold text-amber-900">
                Usuario creado. Guarda esta contraseña ahora: no volverá a
                mostrarse.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-white px-3 py-2 font-mono text-sm text-gray-900 ring-1 ring-amber-200">
                  {generatedPassword}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPassword)
                    toast.success('Contraseña copiada al portapapeles.')
                  }}
                >
                  Copiar
                </Button>
              </div>
              <p className="mt-2 text-xs text-amber-800">
                Entrégala al usuario por un medio seguro y recomiéndale
                cambiarla desde Mi Perfil.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  setGeneratedPassword(null)
                  onOpenChange(false)
                }}
              >
                Entendido, cerrar
              </Button>
            </DialogFooter>
          </div>
        )}

        {!generatedPassword && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="grid grid-cols-2 gap-x-8 gap-y-6 py-4"
        >
          <div className="space-y-4">
            <form.Field
              name="nombre"
              children={(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor={field.name}
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Nombre Completo
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ej. Carlos Javier Perez"
                    className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                  {field.state.meta.errors?.length > 0 && (
                    <span className="text-xs text-red-600 dark:text-red-400">
                      {String(field.state.meta.errors[0]?.message)}
                    </span>
                  )}
                </div>
              )}
            />

            <form.Field
              name="email"
              children={(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor={field.name}
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Email Institucional
                  </Label>
                  <Input
                    id={field.name}
                    type="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="cperez@university.edu"
                    className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                  {field.state.meta.errors?.length > 0 && (
                    <span className="text-xs text-red-600 dark:text-red-400">
                      {String(field.state.meta.errors[0]?.message)}
                    </span>
                  )}
                </div>
              )}
            />
          </div>

          <div className="space-y-4">
            <form.Field
              name="rol"
              children={(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor={field.name}
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Rol Principal
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(value as Rol)
                      setSelectedRol(value as Rol)
                    }}
                  >
                    <SelectTrigger className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ESTUDIANTE">Estudiante</SelectItem>
                      <SelectItem value="DOCENTE">Docente</SelectItem>
                      <SelectItem value="TUTOR">Tutor</SelectItem>
                      <SelectItem value="TRIBUNAL">Tribunal</SelectItem>
                      <SelectItem value="DIRECTOR">Director</SelectItem>
                      <SelectItem value="DTC">DTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            {selectedRol !== 'ESTUDIANTE' && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-gray-700 dark:text-gray-300">
                  Capacidades adicionales
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ['TUTOR_TESIS', 'Tutor de Tesis'],
                      ['TRIBUNAL', 'Tribunal'],
                      ['TIEMPO_COMPLETO', 'Docente a Tiempo Completo'],
                      ['DOCENTE_MATERIA', 'Docente de Materia'],
                    ] as const
                  ).map(([value, label]) => (
                    <label
                      key={value}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant p-2 text-sm text-on-surface-variant transition-colors hover:border-primary"
                    >
                      <Checkbox
                        checked={capacidades.includes(value)}
                        onCheckedChange={() => toggleCapacidad(value)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  Los roles de tutor/tribunal efectivos se derivan de las
                  asignaciones por estudiante.
                </p>
              </div>
            )}

            {!isEditing && (
              <form.Field
                name="sendEmail"
                children={(field) => (
                  <div className="flex items-center gap-3 pt-2">
                    <Checkbox
                      id="send-email"
                      checked={field.state.value}
                      onCheckedChange={(checked) => field.handleChange(!!checked)}
                    />
                    <Label
                      htmlFor="send-email"
                      className="text-sm font-normal text-gray-700 dark:text-gray-300"
                    >
                      Enviar credenciales por email automaticamente
                    </Label>
                  </div>
                )}
              />
            )}
          </div>

          <DialogFooter className="col-span-2 pt-4 border-t border-gray-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
              children={({ canSubmit, isSubmitting }) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting
                    ? 'Guardando...'
                    : isEditing
                      ? 'Actualizar Usuario'
                      : 'Guardar Usuario'}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
