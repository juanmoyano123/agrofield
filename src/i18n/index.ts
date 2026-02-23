import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// es-AR resources
import esARCommon from './locales/es-AR/common.json'
import esARAuth from './locales/es-AR/auth.json'
import esARLotes from './locales/es-AR/lotes.json'
import esARCompras from './locales/es-AR/compras.json'
import esARDashboard from './locales/es-AR/dashboard.json'
import esARStock from './locales/es-AR/stock.json'
import esARContratistas from './locales/es-AR/contratistas.json'
import esARCampo from './locales/es-AR/campo.json'
import esARValidation from './locales/es-AR/validation.json'
import esARSync from './locales/es-AR/sync.json'

// es-UY resources (only overrides)
import esUYCommon from './locales/es-UY/common.json'

// pt-BR resources
import ptBRCommon from './locales/pt-BR/common.json'
import ptBRAuth from './locales/pt-BR/auth.json'
import ptBRLotes from './locales/pt-BR/lotes.json'
import ptBRCompras from './locales/pt-BR/compras.json'
import ptBRDashboard from './locales/pt-BR/dashboard.json'
import ptBRStock from './locales/pt-BR/stock.json'
import ptBRContratistas from './locales/pt-BR/contratistas.json'
import ptBRCampo from './locales/pt-BR/campo.json'
import ptBRValidation from './locales/pt-BR/validation.json'
import ptBRSync from './locales/pt-BR/sync.json'

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Default and fallback language
    lng: 'es-AR',
    fallbackLng: 'es-AR',

    // Namespaces
    ns: ['common', 'auth', 'lotes', 'compras', 'dashboard', 'stock', 'contratistas', 'campo', 'validation', 'sync'],
    defaultNS: 'common',

    // Resources — bundled inline (no lazy loading needed for this app size)
    resources: {
      'es-AR': {
        common: esARCommon,
        auth: esARAuth,
        lotes: esARLotes,
        compras: esARCompras,
        dashboard: esARDashboard,
        stock: esARStock,
        contratistas: esARContratistas,
        campo: esARCampo,
        validation: esARValidation,
        sync: esARSync,
      },
      'es-UY': {
        common: { ...esARCommon, ...esUYCommon },
        auth: esARAuth,
        lotes: esARLotes,
        compras: esARCompras,
        dashboard: esARDashboard,
        stock: esARStock,
        contratistas: esARContratistas,
        campo: esARCampo,
        validation: esARValidation,
        sync: esARSync,
      },
      'pt-BR': {
        common: ptBRCommon,
        auth: ptBRAuth,
        lotes: ptBRLotes,
        compras: ptBRCompras,
        dashboard: ptBRDashboard,
        stock: ptBRStock,
        contratistas: ptBRContratistas,
        campo: ptBRCampo,
        validation: ptBRValidation,
        sync: ptBRSync,
      },
    },

    interpolation: {
      // React already escapes values — no need for i18next to double-escape
      escapeValue: false,
    },

    detection: {
      // Order: localStorage key first, then browser preference
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
  })

export default i18n
