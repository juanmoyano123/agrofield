import { z } from 'zod'

export const eventoInsumoSchema = z.object({
  productoId: z.string().min(1, 'Seleccione un producto'),
  productoName: z.string().min(1, 'El nombre del producto es obligatorio'),
  cantidad: z.coerce.number().positive('La cantidad debe ser mayor a 0'),
  unidad: z.string(),
  costoUnitario: z.coerce.number().min(0, 'El costo debe ser 0 o mayor'),
  subtotal: z.coerce.number(),
})

export const eventoFormSchema = z.object({
  tipo: z.enum(['siembra', 'aplicacion', 'cosecha', 'monitoreo', 'servicio', 'riego', 'otro'], {
    error: 'Seleccione un tipo de evento',
  }),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  insumos: z.array(eventoInsumoSchema).default([]),
  costoManual: z.coerce.number().min(0, 'El costo debe ser 0 o mayor').optional(),
  responsable: z.string().optional(),
  notas: z.string().optional(),
})

export type EventoFormSchema = z.infer<typeof eventoFormSchema>
export type EventoInsumoFormSchema = z.infer<typeof eventoInsumoSchema>
