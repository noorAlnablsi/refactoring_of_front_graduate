import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { bootstrapAuth, waitForAuthHydration } from './lib/authSession'
import './index.css'
import App from './App.jsx'

async function startApp() {
  const rootElement = document.getElementById('root')

  await waitForAuthHydration()
  await bootstrapAuth()

  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
}

startApp()
