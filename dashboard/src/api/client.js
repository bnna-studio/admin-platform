const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function register(orgName, orgSlug, email, password, displayName) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgName, orgSlug, email, password, displayName })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Registration failed');
  }

  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Login failed');
  }

  return res.json();
}

export async function getMe(token) {
  const res = await fetch(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error('Failed to get user');
  }

  return res.json();
}

export async function getSites(token) {
  const res = await fetch(`${API_URL}/sites`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error('Failed to get sites');
  }

  return res.json();
}

export async function getListings(token, siteId) {
  const res = await fetch(`${API_URL}/sites/${siteId}/listings`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error('Failed to get listings');
  }

  return res.json();
}

export async function createListing(token, siteId, data) {
  const res = await fetch(`${API_URL}/sites/${siteId}/listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create listing');
  }

  return res.json();
}

export async function updateListing(token, siteId, listingId, data) {
  const res = await fetch(`${API_URL}/sites/${siteId}/listings/${listingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update listing');
  }

  return res.json();
}

export async function deleteListing(token, siteId, listingId) {
  const res = await fetch(`${API_URL}/sites/${siteId}/listings/${listingId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error('Failed to delete listing');
  }

  return res.json();
}

export async function getSEOSettings(token, siteId) {
  const res = await fetch(`${API_URL}/sites/${siteId}/seo`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error('Failed to get SEO settings');
  }

  return res.json();
}

export async function createSEOSettings(token, siteId, data) {
  const res = await fetch(`${API_URL}/sites/${siteId}/seo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create SEO settings');
  }

  return res.json();
}

export async function updateSEOSettings(token, siteId, seoId, data) {
  const res = await fetch(`${API_URL}/sites/${siteId}/seo/${seoId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update SEO settings');
  }

  return res.json();
}

export async function deleteSEOSettings(token, siteId, seoId) {
  const res = await fetch(`${API_URL}/sites/${siteId}/seo/${seoId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error('Failed to delete SEO settings');
  }

  return res.json();
}