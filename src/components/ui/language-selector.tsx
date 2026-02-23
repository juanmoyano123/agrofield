/**
 * LanguageSelector
 *
 * A compact dropdown that lets the user switch the app's UI language.
 * Persists the selection to localStorage via i18next-browser-languagedetector.
 *
 * Usage:
 *   <LanguageSelector />                  // inline default
 *   <LanguageSelector variant="compact" /> // icon-only for tight spaces
 */

import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

const LANGUAGES = [
  { code: 'es-AR', labelKey: 'language.esAR' },
  { code: 'es-UY', labelKey: 'language.esUY' },
  { code: 'pt-BR', labelKey: 'language.ptBR' },
] as const

interface LanguageSelectorProps {
  /** compact: icon + short code; default: icon + full label */
  variant?: 'default' | 'compact'
  className?: string
}

export function LanguageSelector({ variant = 'default', className = '' }: LanguageSelectorProps) {
  const { t, i18n } = useTranslation('common')

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    void i18n.changeLanguage(e.target.value)
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Globe size={14} className="text-text-muted shrink-0" aria-hidden="true" />
        <select
          value={i18n.language}
          onChange={handleChange}
          aria-label={t('language.label')}
          className="
            text-xs text-text-dim bg-transparent border-none
            focus:outline-none cursor-pointer
            hover:text-text-primary transition-colors
          "
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.code}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe size={16} className="text-text-muted shrink-0" aria-hidden="true" />
      <select
        value={i18n.language}
        onChange={handleChange}
        aria-label={t('language.label')}
        className="
          text-sm text-text-primary bg-transparent
          border border-border-warm rounded-sm
          px-2 py-1.5 min-h-[36px]
          hover:border-copper-light
          focus:outline-none focus:ring-2 focus:ring-field-green focus:border-transparent
          cursor-pointer transition-colors
        "
      >
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>
            {t(lang.labelKey)}
          </option>
        ))}
      </select>
    </div>
  )
}
