import { z } from 'zod'

export const compraItemSchema = z.object({
  productoName: z.string().min(1, 'El nombre del producto es obligatorio'),
  cantidad: z.coerce.number().positive('La cantidad debe ser mayor a 0'),
  unidad: z.enum(['Litros', 'Kilos', 'Unidades', 'Bolsas', 'Toneladas']),
  precioUnitario: z.coerce.number().positive('El precio debe ser mayor a 0'),
})

export const compraFormSchema = z.object({
  proveedorId: z.string(),
  proveedorName: z.string(),
  proveedorTelefono: z.string(),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  numeroFactura: z.string(),
  moneda: z.enum(['ARS', 'USD']),
  notas: z.string(),
  items: z.array(compraItemSchema).min(1, 'Debe agregar al menos un producto'),
}).superRefine((data, ctx) => {
  if (data.proveedorId === '' && data.proveedorName.trim() === '') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El nombre del proveedor es obligatorio',
      path: ['proveedorName'],
    })
  }
})

export type CompraItemFormSchema = z.infer<typeof compraItemSchema>
export type CompraFormSchema = z.infer<typeof compraFormSchema>
