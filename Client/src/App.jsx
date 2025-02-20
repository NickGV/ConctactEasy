import { Toaster } from 'sonner'
import { useState } from 'react'
import { ContactsProvider } from './context/ContactsProvider'
import { ContactPage } from './pages/ContactsPage'
import { ChatPage } from './pages/ChatPage'
import { Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { Layout } from './components/Layout'
import { RegisterPage } from './pages/RegisterPage'

function App () {
  const [showForm, setShowForm] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  const toggleAddContactForm = () => {
    setShowForm(!showForm)
  }

  return (
    <>
      <ContactsProvider>
        <Toaster richColors closeButton />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {isAuthenticated
            ? (
            <Route element={<Layout toggleAddContactForm={toggleAddContactForm} />}>
              <Route path="/" element={<ContactPage toggleAddContactForm={toggleAddContactForm} showForm={showForm} />} />
              <Route path="/contacts" element={<ContactPage toggleAddContactForm={toggleAddContactForm} showForm={showForm} />} />
              <Route path="/chat" element={<ChatPage />} />
            </Route>
              )
            : (
            <Route path="*" element={<LoginPage />} />
              )}
        </Routes>
      </ContactsProvider>
    </>
  )
}

export default App
