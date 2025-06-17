"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '@/services/authService'
import { AuthContextType } from '@/interfaces/Auth'

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const user = await authService.getCurrentUser()
      setUser(user)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (token: string) => {
    try {
      const user = await authService.getCurrentUser()
      setUser(user)
    } catch (error) {
      console.error('Error setting user:', error)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  // Nueva función para actualizar el usuario en el contexto
  const updateUser = (userData: any) => {
    setUser(userData)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)