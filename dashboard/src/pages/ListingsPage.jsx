import { useState, useEffect } from 'react'
import { getListings, createListing, updateListing, deleteListing } from '../api/client.js'
import './ListingsPage.css'

export default function ListingsPage({ siteId, user }) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filter, setFilter] = useState('all')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    status: 'draft'
  })

  // Load listings
  useEffect(() => {
    loadListings()
  }, [siteId])

  const loadListings = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const data = await getListings(token, siteId)
      setListings(data.listings)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const token = localStorage.getItem('token')
      
      if (editingId) {
        await updateListing(token, siteId, editingId, formData)
      } else {
        await createListing(token, siteId, formData)
      }

      setFormData({ title: '', description: '', price: '', status: 'draft' })
      setShowForm(false)
      setEditingId(null)
      await loadListings()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (listing) => {
    setFormData({
      title: listing.title,
      description: listing.description || '',
      price: listing.price || '',
      status: listing.status
    })
    setEditingId(listing.id)
    setShowForm(true)
  }

  const handleDelete = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      await deleteListing(token, siteId, listingId)
      await loadListings()
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredListings = listings.filter(
    listing => filter === 'all' || listing.status === filter
  )

  if (loading) {
    return <div className="listings-container"><p>Loading listings...</p></div>
  }

  return (
    <div className="listings-container">
      <div className="listings-header">
        <h2>Listings Management</h2>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ title: '', description: '', price: '', status: 'draft' })
          }}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ New Listing'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="listing-form">
          <h3>{editingId ? 'Edit Listing' : 'Create New Listing'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Listing title"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Listing description"
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary">
              {editingId ? 'Update Listing' : 'Create Listing'}
            </button>
          </form>
        </div>
      )}

      <div className="listings-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({listings.length})
        </button>
        <button
          className={`filter-btn ${filter === 'draft' ? 'active' : ''}`}
          onClick={() => setFilter('draft')}
        >
          Draft ({listings.filter(l => l.status === 'draft').length})
        </button>
        <button
          className={`filter-btn ${filter === 'published' ? 'active' : ''}`}
          onClick={() => setFilter('published')}
        >
          Published ({listings.filter(l => l.status === 'published').length})
        </button>
      </div>

      {filteredListings.length === 0 ? (
        <p className="empty-state">No listings yet. Create one to get started!</p>
      ) : (
        <div className="listings-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.map(listing => (
                <tr key={listing.id}>
                  <td className="title-cell">{listing.title}</td>
                  <td>{listing.price ? `$${listing.price.toFixed(2)}` : '-'}</td>
                  <td>
                    <span className={`status-badge status-${listing.status}`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="date-cell">{new Date(listing.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleEdit(listing)}
                      className="btn-small btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(listing.id)}
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
    </div>
  )
}
