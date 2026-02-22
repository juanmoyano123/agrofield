import { z } from 'zod'

export const createLoteSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  hectareas: z
    .number({ invalid_type_error: 'La superficie debe ser un número' })
    .min(0.1, 'La superficie debe estar entre 0.1 y 10.000 hectáreas')
    .max(10000, 'La superficie debe estar entre 0.1 y 10.000 hectáreas'),
  actividad: z.enum(['agricultura', 'ganaderia'], {
    errorMap: () => ({ message: 'Seleccioná una actividad válida' }),
  }),
  ubicacion: z.string().optional(),
  latitud: z
    .number({ invalid_type_error: 'La latitud debe ser un número' })
    .min(-90, 'Latitud inválida')
    .max(90, 'Latitud inválida')
    .optional(),
  longitud: z
    .number({ invalid_type_error: 'La longitud debe ser un número' })
    .min(-180, 'Longitud inválida')
    .max(180, 'Longitud inválida')
    .optional(),
})

export const updateLoteSchema = createLoteSchema.partial()

export type CreateLoteFormData = z.infer<typeof createLoteSchema>
export type UpdateLoteFormData = z.infer<typeof updateLoteSchema>
