import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  picture: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  getSessionToken: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 同網域呼叫 Pages Functions；若在任意 localhost（非 wrangler 的 8788）改用正式站 API
const isBrowser = typeof window !== 'undefined'
const origin = isBrowser ? window.location.origin : ''
const isLocalhost = isBrowser && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
const isWranglerDev = isBrowser && origin.includes(':8788')
const API_BASE = isLocalhost && !isWranglerDev ? 'https://catar-homepage.pages.dev' : ''

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 從 localStorage 獲取 session token
  const getSessionToken = (): string | null => {
    return localStorage.getItem('session_token')
  }

  // 驗證當前 session
  const verifySession = async () => {
    const token = getSessionToken()
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth?action=verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.authenticated) {
          setUser(data.user)
        } else {
          localStorage.removeItem('session_token')
        }
      } else {
        localStorage.removeItem('session_token')
      }
    } catch (error) {
      console.error('Session verification failed:', error)
      localStorage.removeItem('session_token')
    } finally {
      setLoading(false)
    }
  }

  // 登入：打開 Google OAuth 頁面
  const login = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth?action=login`)
      const raw = await response.text()
      let data: any
      try {
        data = JSON.parse(raw)
      } catch {
        console.error('Login API non-JSON response:', raw)
        throw new Error(`登入端點回應非 JSON（HTTP ${response.status}）。請確認 Cloudflare Pages Functions 已部署並可用`)
      }
      if (data.url) {
        // 重定向到 Google 登入頁面
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Login failed:', error)
      alert('登入失敗，請稍後再試')
    }
  }

  // 登出
  const logout = async () => {
    const token = getSessionToken()
    if (token) {
      try {
        await fetch(`${API_BASE}/api/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ action: 'logout' }),
        })
      } catch (error) {
        console.error('Logout failed:', error)
      }
    }

    localStorage.removeItem('session_token')
    setUser(null)
  }

  // 初始化：檢查 URL 中的 session token (OAuth callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionToken = params.get('session')
    const loginSuccess = params.get('login')

    if (sessionToken && loginSuccess === 'success') {
      // 儲存 session token
      localStorage.setItem('session_token', sessionToken)
      // 清除 URL 參數
      window.history.replaceState({}, document.title, window.location.pathname)
      // 驗證 session
      verifySession()
    } else {
      // 正常啟動時驗證現有 session
      verifySession()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getSessionToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

