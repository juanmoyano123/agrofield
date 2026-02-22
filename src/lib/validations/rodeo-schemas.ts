import { z } from 'zod'

export const createEventoRodeoSchema = z.object({
  tipo: z.enum(
    [
      'pesaje',
      'vacunacion',
      'desparasitacion',
      'curacion',
      'servicio_toro',
      'inseminacion',
      'tacto',
      'paricion',
      'destete',
      'ingreso',
      'egreso',
      'muerte',
    ],
    { error: 'Seleccioná un tipo' },
  ),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  cantidadCabezas: z.coerce.number().int().positive('Debe ser mayor a 0'),
  pesoPromedio: z.coerce.number().positive().optional(),
  productoSanitario: z.string().optional(),
  dosisMl: z.coerce.number().positive().optional(),
  loteSanitario: z.string().optional(),
  veterinario: z.string().optional(),
  proximaDosis: z.string().optional(),
  toroId: z.string().optional(),
  resultadoTacto: z.enum(['prenada', 'vacia', 'dudosa']).optional(),
  cantidadPreniadas: z.coerce.number().int().min(0).optional(),
  cantidadVacias: z.coerce.number().int().min(0).optional(),
  pesoDestete: z.coerce.number().positive().optional(),
  motivo: z.string().optional(),
  origenDestino: z.string().optional(),
  precioUnitario: z.coerce.number().min(0).optional(),
  costoManual: z.coerce.number().min(0).optional(),
  responsable: z.string().optional(),
  notas: z.string().optional(),
})

export type CreateEventoRodeoSchema = z.infer<typeof createEventoRodeoSchema>
