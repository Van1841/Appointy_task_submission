import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#131318',
            color: '#fff',
            border: '1px solid #2a2a35',
          },
          success: {
            iconTheme: {
              primary: '#00ff9d',
              secondary: '#131318',
            },
          },
          error: {
            iconTheme: {
              primary: '#ec4899',
              secondary: '#131318',
            },
          },
        }}
      />
    </AuthProvider>
  </React.StrictMode>,
)
