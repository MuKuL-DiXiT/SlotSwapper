import { createContext, useContext, useEffect, useState } from 'react'
import Router from 'next/router'

// Base URL for the backend API. Frontend will call `${API_BASE}/api/...`
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const t = localStorage.getItem('token')
    const u = localStorage.getItem('user')
    if (t && u) {
      setToken(t)
      setUser(JSON.parse(u))
    }
  }, [])

  const login = (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setToken(token)
    setUser(user)
    Router.push('/dashboard')
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    Router.push('/login')
  }

  const authFetch = (url, opts = {}) => {
    const headers = opts.headers || {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const fetchUrl = url.startsWith('http') ? url : `${API_BASE}${url}`
    return fetch(fetchUrl, { ...opts, headers: { 'Content-Type': 'application/json', ...headers } })
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  return useContext(AuthContext)
}
