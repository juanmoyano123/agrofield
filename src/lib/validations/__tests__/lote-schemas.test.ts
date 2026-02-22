import { describe, it, expect } from 'vitest'
import { createLoteSchema, updateLoteSchema } from '../lote-schemas'

const validData = {
  nombre: 'Lote Norte',
  hectareas: 120,
  actividad: 'agricultura' as const,
}

describe('createLoteSchema', () => {
  it('validates correct data (minimum fields)', () => {
    const result = createLoteSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('validates correct data with all optional fields', () => {
    const result = createLoteSchema.safeParse({
      ...validData,
      ubicacion: 'Sector norte',
      latitud: -34.6037,
      longitud: -58.3816,
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty nombre', () => {
    const result = createLoteSchema.safeParse({ ...validData, nombre: '' })
    expect(result.success).toBe(false)
  })

  it('rejects nombre shorter than 2 characters', () => {
    const result = createLoteSchema.safeParse({ ...validData, nombre: 'A' })
    expect(result.success).toBe(false)
  })

  it('rejects hectareas below 0.1', () => {
    const result = createLoteSchema.safeParse({ ...validData, hectareas: 0.05 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const msg = result.error.issues[0].message
      expect(msg).toContain('0.1')
    }
  })

  it('rejects hectareas above 10000', () => {
    const result = createLoteSchema.safeParse({ ...validData, hectareas: 10001 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const msg = result.error.issues[0].message
      expect(msg).toContain('10.000')
    }
  })

  it('accepts hectareas at the minimum boundary (0.1)', () => {
    const result = createLoteSchema.safeParse({ ...validData, hectareas: 0.1 })
    expect(result.success).toBe(true)
  })

  it('accepts hectareas at the maximum boundary (10000)', () => {
    const result = createLoteSchema.safeParse({ ...validData, hectareas: 10000 })
    expect(result.success).toBe(true)
  })

  it('rejects invalid actividad value', () => {
    const result = createLoteSchema.safeParse({ ...validData, actividad: 'mineria' })
    expect(result.success).toBe(false)
  })

  it('accepts ganaderia as actividad', () => {
    const result = createLoteSchema.safeParse({ ...validData, actividad: 'ganaderia' })
    expect(result.success).toBe(true)
  })

  it('accepts ubicacion as optional (undefined)', () => {
    const result = createLoteSchema.safeParse({ ...validData, ubicacion: undefined })
    expect(result.success).toBe(true)
  })

  it('rejects latitud out of range', () => {
    const result = createLoteSchema.safeParse({ ...validData, latitud: -91 })
    expect(result.success).toBe(false)
  })

  it('rejects longitud out of range', () => {
    const result = createLoteSchema.safeParse({ ...validData, longitud: 181 })
    expect(result.success).toBe(false)
  })
})

describe('updateLoteSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    const result = updateLoteSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('validates partial update with only nombre', () => {
    const result = updateLoteSchema.safeParse({ nombre: 'Nuevo nombre' })
    expect(result.success).toBe(true)
  })

  it('still validates hectareas range when provided', () => {
    const result = updateLoteSchema.safeParse({ hectareas: 0.05 })
    expect(result.success).toBe(false)
  })
})
