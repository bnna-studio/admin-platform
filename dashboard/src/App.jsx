import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage.jsx'
import ListingsPage from './pages/ListingsPage.jsx'
import SEOSettingsPage from './pages/SEOSettingsPage.jsx'
import { getSites } from './api/client.js'
import './App.css'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [organization, setOrganization] = useState(null)
  const [sites, setSites] = useState([])
  const [selectedSiteId, setSelectedSiteId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('listings')

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
        loadSites(token)
      }
    }
    setLoading(false)
  }, [])

  const loadSites = async (token) => {
    try {
      const data = await getSites(token)
      setSites(data.sites)
      if (data.sites.length > 0) {
        setSelectedSiteId(data.sites[0].id)
      }
    } catch (error) {
      console.error('Failed to load sites:', error)
    }
  }

  const handleLoginSuccess = () => {
    const userData = localStorage.getItem('user')
    const orgData = localStorage.getItem('organization')
    const token = localStorage.getItem('token')
    setUser(JSON.parse(userData))
    setOrganization(JSON.parse(orgData))
    setIsLoggedIn(true)
    loadSites(token)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('organization')
    setUser(null)
    setOrganization(null)
    setIsLoggedIn(false)
    setSites([])
    setSelectedSiteId(null)
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
            <span className="org-name">{organization?.name}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="user-card">
            <p className="user-email">{user?.email}</p>
            <p className="user-role">{user?.role}</p>
          </div>

          <nav className="sidebar-nav">
            <h3>Navigation</h3>
            <button
              className={`nav-item ${currentPage === 'listings' ? 'active' : ''}`}
              onClick={() => setCurrentPage('listings')}
            >
              📝 Listings
            </button>
            <button
              className={`nav-item ${currentPage === 'seo' ? 'active' : ''}`}
              onClick={() => setCurrentPage('seo')}
            >
              🔍 SEO Settings
            </button>
            <p className="nav-coming-soon">🔜 Sites (Coming soon)</p>
          </nav>
        </aside>

        <main className="dashboard-main">
          {sites.length === 0 ? (
            <div className="no-sites">
              <p>No sites found. Create one to get started!</p>
              <p className="help-text">(Coming soon: Site management)</p>
            </div>
          ) : (
            <>
              <div className="site-selector">
                <label>Selected Site:</label>
                <select
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                >
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>
                      {site.name} ({site.domain})
                    </option>
                  ))}
                </select>
              </div>

              {currentPage === 'listings' && selectedSiteId && (
                <ListingsPage siteId={selectedSiteId} user={user} />
              )}

              {currentPage === 'seo' && selectedSiteId && (
                <SEOSettingsPage siteId={selectedSiteId} user={user} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}