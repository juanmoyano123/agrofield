import { describe, it, expect } from 'vitest'
import { compraFormSchema, compraItemSchema } from '../compras-schemas'

// Helper: a valid item
const validItem = {
  productoName: 'Roundup 480',
  cantidad: 100,
  unidad: 'Litros' as const,
  precioUnitario: 4500,
}

// Helper: a valid complete form
const validForm = {
  proveedorId: 'prov-001',
  proveedorName: 'AgroInsumos SA',
  proveedorTelefono: '+54 341 4123456',
  fecha: '2026-02-21',
  numeroFactura: 'FA-0001',
  moneda: 'ARS' as const,
  notas: '',
  items: [validItem],
}

// --- compraItemSchema ---

describe('compraItemSchema', () => {
  it('validates a correct item', () => {
    const result = compraItemSchema.safeParse(validItem)
    expect(result.success).toBe(true)
  })

  it('rejects empty productoName', () => {
    const result = compraItemSchema.safeParse({ ...validItem, productoName: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('productoName'))).toBe(true)
    }
  })

  it('rejects cantidad of 0', () => {
    const result = compraItemSchema.safeParse({ ...validItem, cantidad: 0 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('cantidad'))).toBe(true)
    }
  })

  it('rejects negative cantidad', () => {
    const result = compraItemSchema.safeParse({ ...validItem, cantidad: -5 })
    expect(result.success).toBe(false)
  })

  it('rejects precioUnitario of 0', () => {
    const result = compraItemSchema.safeParse({ ...validItem, precioUnitario: 0 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('precioUnitario'))).toBe(true)
    }
  })

  it('rejects negative precioUnitario', () => {
    const result = compraItemSchema.safeParse({ ...validItem, precioUnitario: -100 })
    expect(result.success).toBe(false)
  })

  it('rejects invalid unidad', () => {
    const result = compraItemSchema.safeParse({ ...validItem, unidad: 'Metros' })
    expect(result.success).toBe(false)
  })

  it('accepts string cantidad via coerce', () => {
    const result = compraItemSchema.safeParse({ ...validItem, cantidad: '50' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.cantidad).toBe(50)
    }
  })
})

// --- compraFormSchema ---

describe('compraFormSchema', () => {
  it('validates a complete form with existing proveedor', () => {
    const result = compraFormSchema.safeParse(validForm)
    expect(result.success).toBe(true)
  })

  it('fails when items array is empty', () => {
    const result = compraFormSchema.safeParse({ ...validForm, items: [] })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('items'))).toBe(true)
    }
  })

  it('fails when proveedorId is empty AND proveedorName is empty', () => {
    const result = compraFormSchema.safeParse({
      ...validForm,
      proveedorId: '',
      proveedorName: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('proveedorName'))).toBe(true)
    }
  })

  it('passes when proveedorId is empty but proveedorName is filled (new proveedor)', () => {
    const result = compraFormSchema.safeParse({
      ...validForm,
      proveedorId: '',
      proveedorName: 'Nuevo Proveedor SRL',
    })
    expect(result.success).toBe(true)
  })

  it('passes when proveedorId is set even if proveedorName is empty', () => {
    const result = compraFormSchema.safeParse({
      ...validForm,
      proveedorId: 'prov-001',
      proveedorName: '',
    })
    expect(result.success).toBe(true)
  })

  it('fails when fecha is empty', () => {
    const result = compraFormSchema.safeParse({ ...validForm, fecha: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('fecha'))).toBe(true)
    }
  })

  it('rejects invalid moneda', () => {
    const result = compraFormSchema.safeParse({ ...validForm, moneda: 'EUR' })
    expect(result.success).toBe(false)
  })

  it('validates with multiple items', () => {
    const result = compraFormSchema.safeParse({
      ...validForm,
      items: [validItem, { ...validItem, productoName: 'Urea', cantidad: 500, unidad: 'Kilos' }],
    })
    expect(result.success).toBe(true)
  })

  it('propagates item-level errors through form schema', () => {
    const result = compraFormSchema.safeParse({
      ...validForm,
      items: [{ ...validItem, cantidad: 0 }],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const hasCantidadError = result.error.issues.some(i =>
        i.path.includes('items') && i.path.includes('cantidad')
      )
      expect(hasCantidadError).toBe(true)
    }
  })
})
