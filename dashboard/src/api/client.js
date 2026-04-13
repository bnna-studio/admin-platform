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
