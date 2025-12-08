import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { enableMocking } from './services/mocks/browser.ts'

// MSW'yi başlat (sadece development'ta ve mock API aktifse)
enableMocking()
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  })
  .catch((error) => {
    console.error('MSW başlatılamadı, uygulama normal modda çalışacak:', error)
    // MSW başlatılamasa bile uygulamayı render et
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  })

