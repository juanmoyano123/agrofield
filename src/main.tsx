import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// F-028: Global print styles for bank/credit report PDF export
import './styles/print.css'
// F-030: i18n setup — must be imported before App so translations are ready
import './i18n/index.ts'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
