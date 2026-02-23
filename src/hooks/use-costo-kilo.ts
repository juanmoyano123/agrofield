/**
 * F-026: Costo por Kilo Ganadero — React hooks.
 *
 * useCostoKiloGlobal: returns CostoKiloLote[] for all active ganaderia lotes,
 *   recomputed only when lotes or eventosRodeo arrays change.
 *
 * useCostoKiloLote: per-lote hook returning CostoKiloLote + desglose for a
 *   single ganaderia lote.
 */

import { useMemo } from 'react'
import { useShallow } from 'zustand/shallow'
import { useLotesStore } from '../stores/lotes-store'
import { useRodeoStore } from '../stores/rodeo-store'
import {
  computeCostoKiloAllLotes,
  computeCostoKiloLote,
  buildCostoKiloDesglose,
  type CostoKiloLote,
  type CostoKiloDesglose,
} from '../lib/costo-kilo-utils'

/**
 * Returns CostoKiloLote[] for all active ganaderia lotes.
 * The array is recreated via useMemo only when underlying arrays change.
 */
export function useCostoKiloGlobal(): CostoKiloLote[] {
  const lotes = useLotesStore(
    useShallow(s =>
      s.lotes
        .filter(l => !l.deletedAt && l.actividad === 'ganaderia')
        .map(l => ({ id: l.id, nombre: l.nombre, actividad: l.actividad, cabezas: l.cabezas })),
    ),
  )
  const eventosRodeo = useRodeoStore(useShallow(s => s.eventos))

  return useMemo(
    () => computeCostoKiloAllLotes(lotes, eventosRodeo),
    [lotes, eventosRodeo],
  )
}

/**
 * Returns CostoKiloLote and per-event desglose for a single ganaderia lote.
 *
 * @param loteId  - The lote's unique identifier
 * @param nombre  - Display name of the lote
 * @param cabezas - Head count from lote.cabezas
 */
export function useCostoKiloLote(
  loteId: string,
  nombre: string,
  cabezas: number,
): { costoKilo: CostoKiloLote; desglose: CostoKiloDesglose[] } {
  const eventosRodeo = useRodeoStore(useShallow(s => s.eventos))

  const costoKilo = useMemo(
    () => computeCostoKiloLote(loteId, nombre, cabezas, eventosRodeo),
    [loteId, nombre, cabezas, eventosRodeo],
  )

  const desglose = useMemo(
    () => buildCostoKiloDesglose(loteId, eventosRodeo),
    [loteId, eventosRodeo],
  )

  return { costoKilo, desglose }
}
