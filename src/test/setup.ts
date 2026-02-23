import '@testing-library/jest-dom/vitest'
// IndexedDB polyfill for jsdom — required by Dexie.js in the test environment
import 'fake-indexeddb/auto'
// F-030: Initialize i18n so components using useTranslation() work in tests
import '../i18n/index.ts'
