import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, setToken, clearToken, getToken } from '../api'

const AuthContext = createContext(null)

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (token) {
      const claims = decodeJwt(token)
      if (claims) setUser({ id: Number(claims.sub), role: claims.role })
    }
    setReady(true)
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await api.signin(email, password)
    setToken(data.access_token)
    const claims = decodeJwt(data.access_token)
    const nextUser = { id: Number(claims.sub), role: claims.role }
    setUser(nextUser)
    return nextUser
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
