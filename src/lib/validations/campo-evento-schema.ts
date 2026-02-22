import { z } from 'zod'

/**
 * campoEventoSchema — simplified event registration schema for the
 * Encargado de Campo role.
 *
 * Compared to eventoFormSchema (used in the full EventosPage), this schema:
 * - Restricts tipo to the 4 most common field operations.
 * - Treats insumo selection as a single optional product + quantity pair
 *   instead of a full line-item array, keeping the mobile form short.
 *
 * F-013: Used in CampoRegistrarPage.
 */
export const campoEventoSchema = z.object({
  tipo: z.enum(['aplicacion', 'siembra', 'cosecha', 'otro'], {
    error: 'Seleccioná un tipo',
  }),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  loteId: z.string().min(1),
  insumoProductoId: z.string().optional(),
  insumoCantidad: z.coerce.number().positive().optional(),
  notas: z.string().optional(),
})

export type CampoEventoSchema = z.infer<typeof campoEventoSchema>
