import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api.js'

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    api.session
      .get()
      .then((res) => setIsAdmin(!!res.isAdmin))
      .catch(() => setIsAdmin(false))
      .finally(() => setChecked(true))
  }, [])

  const login = useCallback(async (passphrase) => {
    await api.session.login(passphrase)
    setIsAdmin(true)
  }, [])

  const logout = useCallback(async () => {
    await api.session.logout()
    setIsAdmin(false)
  }, [])

  return (
    <AdminContext.Provider value={{ isAdmin, checked, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
