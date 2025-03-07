import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Принудительно устанавливаем светлую тему, игнорируя системные настройки
import './styles/theme-override.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
