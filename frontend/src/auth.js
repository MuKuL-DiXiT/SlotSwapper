import { createContext, useContext, useEffect, useState } from 'react'
import Router from 'next/router'

// Base URL for the backend API. Frontend will call `${API_BASE}/api/...`
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [socketMessage, setSocketMessage] = useState(null)
  const [socketInstance, setSocketInstance] = useState(null)

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

  // Initialize Socket.IO client when the token becomes available.
  // We import the client dynamically to avoid SSR issues.
  useEffect(() => {
    if (!token) {
      // cleanup if token removed
      if (socketInstance) {
        try { socketInstance.disconnect(); } catch (e) {}
        setSocketInstance(null)
      }
      return
    }

    let mounted = true
    let s = null
    import('socket.io-client').then(({ io }) => {
      if (!mounted) return
      try {
        s = io(API_BASE.replace(/^http/, 'ws'), { transports: ['websocket'] })
      } catch (err) {
        s = io(API_BASE, { transports: ['websocket'] })
      }
      // authenticate with the server so it can map socket -> user
      s.on('connect', () => {
        s.emit('authenticate', { token })
      })
      s.on('swap-request', payload => setSocketMessage({ event: 'swap-request', payload }))
      s.on('swap-accepted', payload => setSocketMessage({ event: 'swap-accepted', payload }))
      setSocketInstance(s)
    }).catch(err => console.error('socket.io-client init failed', err))

    return () => { mounted = false; if (s) { try { s.disconnect() } catch (e) {} } }
  }, [token])

  const clearSocketMessage = () => setSocketMessage(null)

  return (
    <AuthContext.Provider value={{ user, token, login, logout, authFetch, socketMessage, clearSocketMessage }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  return useContext(AuthContext)
}
