import { useState, useEffect } from 'react'
import { getSites, deleteSite } from '../api/client.js'
import './SitesPage.css'

export default function SitesPage({ onSitesChanged }) {
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedSiteId, setCopiedSiteId] = useState(null)
  const [siteToDelete, setSiteToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

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
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyApiKey = async (site) => {
    try {
      await navigator.clipboard.writeText(site.apiKey)
      setCopiedSiteId(site.id)
      setTimeout(() => setCopiedSiteId(null), 1500)
    } catch (err) {
      setError('Failed to copy API key')
    }
  }

  const handleConfirmDelete = async () => {
    if (!siteToDelete) return
    setDeleting(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      await deleteSite(token, siteToDelete.id)
      setSiteToDelete(null)
      await loadSites()
      if (onSitesChanged) onSitesChanged()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="sites-container"><p>Loading sites...</p></div>
  }

  return (
    <div className="sites-container">
      <div className="sites-header">
        <h2>Sites</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      {sites.length === 0 ? (
        <p className="empty-state">No sites yet.</p>
      ) : (
        <div className="sites-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Domain</th>
                <th>API Key</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map(site => (
                <tr key={site.id}>
                  <td className="name-cell">{site.name}</td>
                  <td>{site.domain}</td>
                  <td className="api-key-cell">
                    <code className="api-key">{site.apiKey}</code>
                    <button
                      onClick={() => handleCopyApiKey(site)}
                      className="btn-small btn-copy"
                      title="Copy API key"
                    >
                      {copiedSiteId === site.id ? 'Copied!' : 'Copy'}
                    </button>
                  </td>
                  <td className="date-cell">{new Date(site.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button
                      onClick={() => setSiteToDelete(site)}
                      className="btn-small btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {siteToDelete && (
        <div className="modal-overlay" onClick={() => !deleting && setSiteToDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete site?</h3>
            <p>
              Are you sure you want to delete <strong>{siteToDelete.name}</strong> ({siteToDelete.domain})?
            </p>
            <p className="modal-warning">
              This will permanently delete the site and <strong>all of its listings and SEO settings</strong>.
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setSiteToDelete(null)}
                className="btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="btn-danger"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete site'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
