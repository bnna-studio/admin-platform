/**
 * Public API Client for the Admin Platform (browser ES module).
 *
 * Example:
 *   import { AdminPlatformClient } from './public-api-client.js';
 *   const client = new AdminPlatformClient(API_KEY, API_URL);
 *   const { listings } = await client.getListings();
 */

export class AdminPlatformClient {
  constructor(apiKey, apiUrl = 'http://localhost:3000') {
    if (!apiKey) {
      throw new Error('AdminPlatformClient: apiKey is required');
    }
    this.apiKey = apiKey;
    this.apiUrl = apiUrl.replace(/\/$/, '');
  }

  async getListings() {
    const res = await fetch(`${this.apiUrl}/public/sites/${this.apiKey}/listings`);
    if (!res.ok) {
      throw new Error(`Failed to fetch listings: ${res.status} ${res.statusText}`);
    }
    return res.json();
  }

  async getAllSEO() {
    const res = await fetch(`${this.apiUrl}/public/sites/${this.apiKey}/seo`);
    if (!res.ok) {
      throw new Error(`Failed to fetch SEO settings: ${res.status} ${res.statusText}`);
    }
    return res.json();
  }

  async getSEO(pagePath) {
    const encoded = encodeURIComponent(pagePath);
    const res = await fetch(`${this.apiUrl}/public/sites/${this.apiKey}/seo/${encoded}`);
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Failed to fetch SEO: ${res.status} ${res.statusText}`);
    }
    return res.json();
  }
}
