import { z } from 'zod'

export const createTrabajoSchema = z.object({
  tipo: z.enum(['arado', 'siembra', 'cosecha', 'pulverizacion', 'otro'], {
    error: 'Seleccioná un tipo de trabajo válido',
  }),
  contratistaId: z.string().min(1, 'El contratista es obligatorio'),
  contratistaNombre: z.string().min(1, 'El nombre del contratista es obligatorio'),
  loteId: z.string().optional(),
  loteNombre: z.string().optional(),
  costo: z
    .number({ error: 'El costo debe ser un número' })
    .min(0.01, 'El costo debe ser mayor a 0'),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  notas: z.string().optional(),
  estado: z.enum(['programado', 'completado'], {
    error: 'Seleccioná un estado válido',
  }),
})

export const updateTrabajoSchema = createTrabajoSchema.partial()

export type CreateTrabajoFormData = z.infer<typeof createTrabajoSchema>
export type UpdateTrabajoFormData = z.infer<typeof updateTrabajoSchema>
