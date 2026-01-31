import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App.jsx'
import { CardSizeProvider } from './cardSize.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CardSizeProvider>
      <App />
    </CardSizeProvider>
  </StrictMode>,
)
