import { Link, Outlet } from 'react-router-dom'
import './Layout.css'

export default function Layout() {
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
