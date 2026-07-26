import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { bootstrapAuth, initAuthSession, waitForAuthHydration } from './lib/authSession'
import { initAccessibility } from './lib/accessibility'
import { initLanguage } from './lib/language'
import { initTheme } from './lib/theme'
import { bindThemeToAuth } from './store/themeStore'
import './i18n'
import './index.css'
import App from './App.jsx'

async function startApp() {
  const rootElement = document.getElementById('root')

  initTheme()
  initLanguage()
  initAccessibility()

  await waitForAuthHydration()
  bindThemeToAuth()
  await bootstrapAuth()
  initAuthSession()

  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
}

startApp()
