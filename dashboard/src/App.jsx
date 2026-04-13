import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage.jsx'
import './App.css'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    if (token) {
      const userData = localStorage.getItem('user')
      const orgData = localStorage.getItem('organization')
      if (userData && orgData) {
        setUser(JSON.parse(userData))
        setOrganization(JSON.parse(orgData))
        setIsLoggedIn(true)
      }
    }
    setLoading(false)
  }, [])

  const handleLoginSuccess = () => {
    const userData = localStorage.getItem('user')
    const orgData = localStorage.getItem('organization')
    setUser(JSON.parse(userData))
    setOrganization(JSON.parse(orgData))
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('organization')
    setUser(null)
    setOrganization(null)
    setIsLoggedIn(false)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="app">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Admin Platform</h1>
          <div className="user-info">
            <span>{organization?.name}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <section>
          <h2>Welcome, {user?.displayName || user?.email}</h2>
          <div className="dashboard-content">
            <p>You are logged in as <strong>{user?.email}</strong></p>
            <p>Organization: <strong>{organization?.name}</strong></p>
            <p>Role: <strong>{user?.role}</strong></p>
            <hr />
            <p className="info-text">✓ Authentication is working!</p>
            <p className="info-text">Next: Build listings & SEO management features</p>
          </div>
        </section>
      </main>
    </div>
  )
}
