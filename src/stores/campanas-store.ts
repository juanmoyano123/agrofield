/**
 * F-027: Campañas store — frontend-only, persisted to localStorage.
 *
 * Campañas are stored exclusively in Zustand with persist middleware.
 * No backend sync required for P3 scope.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Campana } from '../types'

interface CampanasActions {
  addCampana: (campana: Omit<Campana, 'id' | 'createdAt'>) => void
  updateCampana: (id: string, data: Omit<Campana, 'id' | 'createdAt'>) => void
  deleteCampana: (id: string) => void
}

type CampanasStore = {
  campanas: Campana[]
} & CampanasActions

export const useCampanasStore = create<CampanasStore>()(
  persist(
    (set, get) => ({
      campanas: [],

      addCampana: (data) => {
        const nueva: Campana = {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          ...data,
        }
        const { campanas } = get()
        // Keep sorted by fechaInicio descending (most recent first)
        const updated = [...campanas, nueva].sort(
          (a, b) => b.fechaInicio.localeCompare(a.fechaInicio),
        )
        set({ campanas: updated })
      },

      updateCampana: (id, data) => {
        const { campanas } = get()
        const updated = campanas
          .map(c => (c.id === id ? { ...c, ...data } : c))
          .sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio))
        set({ campanas: updated })
      },

      deleteCampana: (id) => {
        const { campanas } = get()
        set({ campanas: campanas.filter(c => c.id !== id) })
      },
    }),
    {
      name: 'agrofield-campanas',
    },
  ),
)
