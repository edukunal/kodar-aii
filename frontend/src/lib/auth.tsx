'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, type User } from './api'

type AuthContextValue = {
  user: User | null
  loading: boolean
  refresh: () => Promise<void>
  loginDev: (name?: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const { user: u } = await api.getMe()
      setUser(u)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const token = api.getToken()
    if (token) {
      refresh().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [refresh])

  const loginDev = async (name?: string) => {
    const { token, user: u } = await api.devLogin(name)
    api.setToken(token)
    setUser(u)
  }

  const logout = async () => {
    await api.logout().catch(() => {})
    api.setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, refresh, loginDev, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
