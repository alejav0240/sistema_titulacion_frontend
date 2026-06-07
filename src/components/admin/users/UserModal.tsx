import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
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

  const form = useForm<UserFormData>({
    defaultValues: {
      nombre: '',
      email: '',
      rol: 'ESTUDIANTE',
      subroles: [],
      sendEmail: true,
    },
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
        })
      } else {
        await createMutation.mutateAsync({
          nombre: value.nombre,
          email: value.email,
          rol: value.rol,
          sendEmail: value.sendEmail,
        })
      }
      onOpenChange(false)
      setSelectedRol('ESTUDIANTE')
      form.reset()
    },
  })

  const [selectedRol, setSelectedRol] = useState<Rol>('ESTUDIANTE')

  useEffect(() => {
    if (isEditing && user) {
      form.setFieldValue('nombre', user.nombre)
      form.setFieldValue('email', user.email)
      form.setFieldValue('rol', user.rol)
      setSelectedRol(user.rol)
    } else {
      form.reset()
      setSelectedRol('ESTUDIANTE')
    }
  }, [user, isEditing, open])

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
      </DialogContent>
    </Dialog>
  )
}
