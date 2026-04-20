import { useState, useEffect } from 'react'
import {
  getSites,
  createSite,
  updateSite,
  deleteSite,
  rotateApiKey
} from '../api/client.js'
import './SitesPage.css'

export default function SitesPage({ onSitesChanged }) {
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  const [formData, setFormData] = useState({ name: '', domain: '' })

  useEffect(() => {
    loadSites()
  }, [])

  const loadSites = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const data = await getSites(token)
      setSites(data.sites)
      onSitesChanged?.(data.sites)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', domain: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const token = localStorage.getItem('token')
      if (editingId) {
        await updateSite(token, editingId, formData)
      } else {
        await createSite(token, formData)
      }
      resetForm()
      await loadSites()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (site) => {
    setFormData({ name: site.name, domain: site.domain })
    setEditingId(site.id)
    setShowForm(true)
  }

  const handleDelete = async (siteId) => {
    if (!window.confirm('Delete this site? All listings and SEO settings will be removed.')) {
      return
    }
    try {
      const token = localStorage.getItem('token')
      await deleteSite(token, siteId)
      await loadSites()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRotateKey = async (siteId) => {
    if (!window.confirm('Rotate the API key? Clients using the old key will stop working.')) {
      return
    }
    try {
      const token = localStorage.getItem('token')
      await rotateApiKey(token, siteId)
      await loadSites()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCopyKey = (site) => {
    navigator.clipboard.writeText(site.apiKey)
    setCopiedId(site.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  if (loading) {
    return <div className="sites-container"><p>Loading sites...</p></div>
  }

  return (
    <div className="sites-container">
      <div className="sites-header">
        <h2>Sites Management</h2>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ New Site'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="site-form">
          <h3>{editingId ? 'Edit Site' : 'Create New Site'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Client Site"
                required
              />
            </div>
            <div className="form-group">
              <label>Domain *</label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="example.com"
                required
              />
            </div>
            <button type="submit" className="btn-primary">
              {editingId ? 'Update Site' : 'Create Site'}
            </button>
          </form>
        </div>
      )}

      {sites.length === 0 ? (
        <p className="empty-state">No sites yet. Create one to start managing content!</p>
      ) : (
        <div className="sites-list">
          {sites.map(site => (
            <div key={site.id} className="site-card">
              <div className="site-info">
                <h3>{site.name}</h3>
                <p className="site-domain">{site.domain}</p>
                <div className="site-api-key">
                  <label>Public API key</label>
                  <div className="api-key-row">
                    <code>{site.apiKey}</code>
                    <button
                      type="button"
                      onClick={() => handleCopyKey(site)}
                      className="btn-small btn-copy"
                    >
                      {copiedId === site.id ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="site-actions">
                <button onClick={() => handleEdit(site)} className="btn-small btn-edit">
                  Edit
                </button>
                <button onClick={() => handleRotateKey(site.id)} className="btn-small btn-rotate">
                  Rotate Key
                </button>
                <button onClick={() => handleDelete(site.id)} className="btn-small btn-delete">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
