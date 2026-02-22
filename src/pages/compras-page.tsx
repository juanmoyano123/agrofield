import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../hooks/use-auth'
import { useCompras } from '../hooks/use-compras'
import { ComprasList } from '../components/compras/compras-list'
import { ComprasTable } from '../components/compras/compras-table'
import { ComprasFilters } from '../components/compras/compras-filters'
import { CompraFormModal } from '../components/compras/compra-form-modal'
import { Fab } from '../components/ui/fab'
import { Button } from '../components/ui/button'
import { Spinner } from '../components/ui/spinner'
import { Alert } from '../components/ui/alert'
import type { Compra } from '../types'

export function ComprasPage() {
  const { user } = useAuth()
  const { compras, proveedores, isLoading, error, fetchCompras, fetchProveedores, fetchProductos } = useCompras()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter state
  const [filterProveedorId, setFilterProveedorId] = useState('')
  const [filterProducto, setFilterProducto] = useState('')
  const [filterFechaDesde, setFilterFechaDesde] = useState('')
  const [filterFechaHasta, setFilterFechaHasta] = useState('')
  const [filterMoneda, setFilterMoneda] = useState('')

  // Fetch data on mount
  useEffect(() => {
    if (!user) return
    void fetchCompras(user.tenantId)
    void fetchProveedores(user.tenantId)
    void fetchProductos(user.tenantId)
  }, [user, fetchCompras, fetchProveedores, fetchProductos])

  // Apply filters
  const filteredCompras = useMemo<Compra[]>(() => {
    return compras.filter(compra => {
      if (filterProveedorId && compra.proveedorId !== filterProveedorId) return false
      if (filterMoneda && compra.moneda !== filterMoneda) return false
      if (filterFechaDesde && compra.fecha < filterFechaDesde) return false
      if (filterFechaHasta && compra.fecha > filterFechaHasta) return false
      if (filterProducto) {
        const query = filterProducto.toLowerCase()
        const match = compra.items.some(item =>
          item.productoName.toLowerCase().includes(query)
        )
        if (!match) return false
      }
      return true
    })
  }, [compras, filterProveedorId, filterMoneda, filterFechaDesde, filterFechaHasta, filterProducto])

  function handleClearFilters() {
    setFilterProveedorId('')
    setFilterProducto('')
    setFilterFechaDesde('')
    setFilterFechaHasta('')
    setFilterMoneda('')
  }

  function handleOpenModal() {
    setIsModalOpen(true)
  }

  function handleCloseModal() {
    setIsModalOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 pb-24 sm:pb-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 font-display">Compras</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Registro de compras de insumos y materiales
          </p>
        </div>

        {/* Desktop: button in header */}
        <div className="hidden sm:block">
          <Button
            type="button"
            variant="primary"
            onClick={handleOpenModal}
          >
            + Nueva Compra
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="error">{error}</Alert>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {/* Content: only render when not loading */}
      {!isLoading && (
        <>
          {/* Filters — show only when there are compras */}
          {compras.length > 0 && (
            <ComprasFilters
              proveedores={proveedores}
              proveedorId={filterProveedorId}
              onProveedorChange={setFilterProveedorId}
              productoQuery={filterProducto}
              onProductoQueryChange={setFilterProducto}
              fechaDesde={filterFechaDesde}
              onFechaDesdeChange={setFilterFechaDesde}
              fechaHasta={filterFechaHasta}
              onFechaHastaChange={setFilterFechaHasta}
              moneda={filterMoneda}
              onMonedaChange={setFilterMoneda}
              onClear={handleClearFilters}
            />
          )}

          {/* Mobile view: list of cards */}
          <div className="sm:hidden">
            <ComprasList
              compras={filteredCompras}
              onAddClick={handleOpenModal}
            />
          </div>

          {/* Desktop view: table */}
          <div className="hidden sm:block">
            <ComprasTable
              compras={filteredCompras}
              onAddClick={handleOpenModal}
            />
          </div>
        </>
      )}

      {/* Mobile FAB */}
      <Fab
        label="Nueva Compra"
        onClick={handleOpenModal}
        className="sm:hidden"
      />

      {/* Form modal */}
      <CompraFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
