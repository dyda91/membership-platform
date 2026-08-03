import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import './index.css'
import router from './routes'
import { AuthProvider } from './contexts/AuthContext'
import { MessagingUnreadProvider } from './contexts/MessagingUnreadContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <MessagingUnreadProvider>
        <RouterProvider router={router} />
      </MessagingUnreadProvider>
    </AuthProvider>
  </StrictMode>,
)
