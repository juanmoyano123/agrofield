/**
 * useLocale — centralizes date/currency formatting based on the active i18n locale.
 *
 * Uses the Intl API so formatting is always locale-correct without extra deps.
 * Changing language via i18next automatically updates the locale used here.
 */

import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'

// Map i18next language codes to Intl locale strings
const CURRENCY_MAP: Record<string, { locale: string; currency: string }> = {
  'es-AR': { locale: 'es-AR', currency: 'ARS' },
  'es-UY': { locale: 'es-UY', currency: 'UYU' },
  'pt-BR': { locale: 'pt-BR', currency: 'BRL' },
}

const FALLBACK = { locale: 'es-AR', currency: 'ARS' }

export function useLocale() {
  const { i18n } = useTranslation()
  const lang = i18n.language

  const localeConfig = CURRENCY_MAP[lang] ?? FALLBACK

  const formatters = useMemo(() => {
    const { locale, currency } = localeConfig

    const dateFormatter = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

    const dateShortFormatter = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
    })

    const currencyFormatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    })

    const numberFormatter = new Intl.NumberFormat(locale)

    return {
      /** Format a date string or Date object to local short format (dd/mm/yyyy) */
      formatDate: (value: string | Date): string => {
        const d = typeof value === 'string' ? new Date(value) : value
        return dateFormatter.format(d)
      },

      /** Format a date to day/month only (dd/mm) */
      formatDateShort: (value: string | Date): string => {
        const d = typeof value === 'string' ? new Date(value) : value
        return dateShortFormatter.format(d)
      },

      /** Format a number as currency using the locale's default currency */
      formatCurrency: (value: number): string => {
        return currencyFormatter.format(value)
      },

      /** Format a plain number with locale-appropriate separators */
      formatNumber: (value: number): string => {
        return numberFormatter.format(value)
      },

      /** The active locale string (e.g. 'es-AR') */
      locale,

      /** The active currency code (e.g. 'ARS') */
      currency,
    }
  }, [localeConfig])

  return formatters
}
