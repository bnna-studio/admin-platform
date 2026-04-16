import { useState, useEffect } from 'react'
import { getSEOSettings, createSEOSettings, updateSEOSettings, deleteSEOSettings } from '../api/client.js'
import './SEOSettingsPage.css'

export default function SEOSettingsPage({ siteId, user }) {
  const [seoSettings, setSeoSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [ogImage, setOgImage] = useState('')

  const [formData, setFormData] = useState({
    pagePath: '',
    metaTitle: '',
    metaDescription: '',
    ogImage: '',
    canonicalUrl: ''
  })

  useEffect(() => {
    loadSEOSettings()
  }, [siteId])

  const loadSEOSettings = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const data = await getSEOSettings(token, siteId)
      setSeoSettings(data.seoSettings)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setOgImage(event.target.result)
        setFormData({ ...formData, ogImage: event.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setOgImage('')
    setFormData({ ...formData, ogImage: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const token = localStorage.getItem('token')

      if (editingId) {
        await updateSEOSettings(token, siteId, editingId, formData)
      } else {
        await createSEOSettings(token, siteId, formData)
      }

      setFormData({ pagePath: '', metaTitle: '', metaDescription: '', ogImage: '', canonicalUrl: '' })
      setOgImage('')
      setShowForm(false)
      setEditingId(null)
      await loadSEOSettings()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (seo) => {
    setFormData({
      pagePath: seo.pagePath,
      metaTitle: seo.metaTitle || '',
      metaDescription: seo.metaDescription || '',
      ogImage: seo.ogImage || '',
      canonicalUrl: seo.canonicalUrl || ''
    })
    setOgImage(seo.ogImage || '')
    setEditingId(seo.id)
    setShowForm(true)
  }

  const handleDelete = async (seoId) => {
    if (!window.confirm('Are you sure you want to delete these SEO settings?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      await deleteSEOSettings(token, siteId, seoId)
      await loadSEOSettings()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return <div className="seo-container"><p>Loading SEO settings...</p></div>
  }

  return (
    <div className="seo-container">
      <div className="seo-header">
        <h2>SEO Settings</h2>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ pagePath: '', metaTitle: '', metaDescription: '', ogImage: '', canonicalUrl: '' })
            setOgImage('')
          }}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ Add Page SEO'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="seo-form">
          <h3>{editingId ? 'Edit SEO Settings' : 'Add SEO Settings for Page'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Page Path *</label>
              <input
                type="text"
                value={formData.pagePath}
                onChange={(e) => setFormData({ ...formData, pagePath: e.target.value })}
                placeholder="/ or /about or /contact"
                required
              />
              <small className="form-help">The URL path for this page (e.g., "/" for homepage, "/about" for about page)</small>
            </div>

            <div className="form-group">
              <label>Meta Title</label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                placeholder="Page title for search engines"
                maxLength="60"
              />
              <small className="form-help">{formData.metaTitle.length}/60 characters (Recommended: 50-60)</small>
            </div>

            <div className="form-group">
              <label>Meta Description</label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="Brief description of the page for search engines"
                rows="3"
                maxLength="160"
              />
              <small className="form-help">{formData.metaDescription.length}/160 characters (Recommended: 150-160)</small>
            </div>

            <div className="form-group">
              <label>Open Graph Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <small className="form-help">Image shown when sharing on social media</small>
              {ogImage && (
                <div className="og-image-preview">
                  <img src={ogImage} alt="OG Preview" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="btn-remove-og-image"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Canonical URL</label>
              <input
                type="url"
                value={formData.canonicalUrl}
                onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                placeholder="https://example.com/page"
              />
              <small className="form-help">Preferred URL for this page (avoid duplicate content issues)</small>
            </div>

            {/* Search Preview */}
            {(formData.metaTitle || formData.metaDescription) && (
              <div className="search-preview">
                <h4>Search Preview</h4>
                <div className="preview-card">
                  <p className="preview-url">{formData.canonicalUrl || `yoursite.com${formData.pagePath}`}</p>
                  <p className="preview-title">{formData.metaTitle || 'Page Title'}</p>
                  <p className="preview-description">{formData.metaDescription || 'Page description will appear here...'}</p>
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary">
              {editingId ? 'Update SEO Settings' : 'Create SEO Settings'}
            </button>
          </form>
        </div>
      )}

      {seoSettings.length === 0 ? (
        <p className="empty-state">No SEO settings yet. Add one to start optimizing your pages!</p>
      ) : (
        <div className="seo-list">
          {seoSettings.map(seo => (
            <div key={seo.id} className="seo-card">
              <div className="seo-card-header">
                <h3>{seo.pagePath}</h3>
                <div className="seo-actions">
                  <button onClick={() => handleEdit(seo)} className="btn-small btn-edit">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(seo.id)} className="btn-small btn-delete">
                    Delete
                  </button>
                </div>
              </div>
              <div className="seo-card-body">
                {seo.ogImage && (
                  <div className="seo-field">
                    <strong>Open Graph Image:</strong>
                    <div className="seo-og-image">
                      <img src={seo.ogImage} alt="OG Image" />
                    </div>
                  </div>
                )}
                {seo.metaTitle && (
                  <div className="seo-field">
                    <strong>Meta Title:</strong>
                    <p>{seo.metaTitle}</p>
                  </div>
                )}
                {seo.metaDescription && (
                  <div className="seo-field">
                    <strong>Meta Description:</strong>
                    <p>{seo.metaDescription}</p>
                  </div>
                )}
                {seo.canonicalUrl && (
                  <div className="seo-field">
                    <strong>Canonical URL:</strong>
                    <p className="seo-url">{seo.canonicalUrl}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}