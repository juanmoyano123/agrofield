import { z } from 'zod'

// Base schema before transform — used as the form shape
// Uses Zod v4 API: { error: '...' } instead of errorMap / invalid_type_error
const createLoteSchemaBase = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  hectareas: z
    .number({ error: 'La superficie debe ser un número' })
    .min(0.1, 'La superficie debe estar entre 0.1 y 10.000 hectáreas')
    .max(10000, 'La superficie debe estar entre 0.1 y 10.000 hectáreas'),
  actividad: z.enum(['agricultura', 'ganaderia'], {
    error: 'Seleccioná una actividad válida',
  }),
  ubicacion: z.string().optional(),
  latitud: z
    .number({ error: 'La latitud debe ser un número' })
    .min(-90, 'Latitud inválida')
    .max(90, 'Latitud inválida')
    .optional(),
  longitud: z
    .number({ error: 'La longitud debe ser un número' })
    .min(-180, 'Longitud inválida')
    .max(180, 'Longitud inválida')
    .optional(),
  // F-021: Livestock fields — only validated/kept when actividad === 'ganaderia'
  cabezas: z.number().int().min(1).max(50000).optional(),
  // Allow empty string so the form can have an unselected/blank state;
  // the transform below converts '' → undefined before the data reaches the store
  raza: z.string().min(2).max(100).optional().or(z.literal('')),
  tipoProduccion: z
    .enum(['cria', 'recria', 'engorde', 'tambo'], { error: 'Seleccioná un tipo' })
    .optional()
    .or(z.literal('')),
  categoriaAnimal: z.string().min(2).max(100).optional().or(z.literal('')),
})

// Schema with transform: clears livestock fields when actividad != 'ganaderia'
// and converts empty strings to undefined for optional text fields.
// The output type reflects the cleaned shape delivered to store actions.
export const createLoteSchema = createLoteSchemaBase.transform((data) => {
  // Start with empty-string → undefined conversions
  const cleaned = {
    ...data,
    raza: data.raza === '' ? undefined : data.raza,
    // Cast away '' — the transform guarantees '' never appears in output
    tipoProduccion: (data.tipoProduccion === '' ? undefined : data.tipoProduccion) as
      | 'cria'
      | 'recria'
      | 'engorde'
      | 'tambo'
      | undefined,
    categoriaAnimal: data.categoriaAnimal === '' ? undefined : data.categoriaAnimal,
  }
  // Clear livestock fields entirely when actividad is not ganaderia
  if (data.actividad !== 'ganaderia') {
    cleaned.cabezas = undefined
    cleaned.raza = undefined
    cleaned.tipoProduccion = undefined
    cleaned.categoriaAnimal = undefined
  }
  return cleaned
})

export const updateLoteSchema = createLoteSchemaBase.partial()

// z.input: pre-transform shape — what react-hook-form registers internally
// (allows '' for optional string/enum fields so controlled inputs start with '')
export type CreateLoteFormData = z.input<typeof createLoteSchema>

// z.output: post-transform shape — what handleSubmit delivers to store actions
export type CreateLoteOutputData = z.output<typeof createLoteSchema>

export type UpdateLoteFormData = z.infer<typeof updateLoteSchema>
