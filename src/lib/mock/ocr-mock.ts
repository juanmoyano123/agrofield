export interface OcrMockResult {
  proveedorName: string
  fecha: string
  numeroFactura: string
  moneda: 'ARS' | 'USD'
  notas: string
  items: Array<{
    productoName: string
    cantidad: number
    unidad: 'Litros' | 'Kilos' | 'Unidades' | 'Bolsas' | 'Toneladas'
    precioUnitario: number
  }>
}

const MOCK_RESULTS: OcrMockResult[] = [
  {
    proveedorName: 'AgroInsumos SA',
    fecha: '2026-02-20',
    numeroFactura: 'FA-0001-00004012',
    moneda: 'ARS',
    notas: 'Remito escaneado',
    items: [
      { productoName: 'Roundup 480', cantidad: 150, unidad: 'Litros', precioUnitario: 4800 },
      { productoName: 'Urea granulada', cantidad: 2000, unidad: 'Kilos', precioUnitario: 900 },
    ],
  },
  {
    proveedorName: 'La Rural Semillas',
    fecha: '2026-02-18',
    numeroFactura: 'RC-0034',
    moneda: 'ARS',
    notas: '',
    items: [
      { productoName: 'Soja DM 4210', cantidad: 30, unidad: 'Bolsas', precioUnitario: 19500 },
    ],
  },
  {
    proveedorName: 'Quimica del Sur SRL',
    fecha: '2026-02-22',
    numeroFactura: 'QS-0001-00000789',
    moneda: 'USD',
    notas: 'Factura en dolares',
    items: [
      { productoName: 'Atrazina 50%', cantidad: 100, unidad: 'Litros', precioUnitario: 12 },
    ],
  },
]

/**
 * Simulates OCR processing of a document (remito or factura).
 * Waits 1.5–3 seconds to mimic a real API call, then returns a random mock result.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function mockOcrProcess(_file: File): Promise<OcrMockResult> {
  // Realistic delay: 1.5s–3s
  const ms = Math.floor(Math.random() * 1500) + 1500
  await new Promise(resolve => setTimeout(resolve, ms))
  return MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)]!
}
