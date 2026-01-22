import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Layout.css'

export default function Layout() {
  const { user, loading, login, logout } = useAuth()

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            CatAR
          </Link>
          <div className="nav-menu">
            <Link to="/" className="nav-link">首頁</Link>
            <Link to="/about" className="nav-link">團隊介紹</Link>
            <Link to="/services" className="nav-link">服務</Link>
          </div>
          <div className="nav-auth">
            {loading ? (
              <span className="auth-loading">載入中...</span>
            ) : user ? (
              <div className="user-menu">
                <img src={user.picture} alt={user.name} className="user-avatar" />
                <span className="user-name">{user.name}</span>
                <button onClick={logout} className="btn-logout">登出</button>
              </div>
            ) : (
              <button onClick={login} className="btn-login">使用 Google 登入</button>
            )}
          </div>
        </div>
      </nav>
      
      <main className="main-content">
        <Outlet />
      </main>
      
      <footer className="footer">
        <div className="footer-container">
          <p>&copy; 2024 CatAR. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
