/**
 * Public API Client for Admin Platform
 * Use this in your client websites to fetch listings and SEO settings
 * 
 * Example usage:
 * const client = new AdminPlatformClient('YOUR_API_KEY', 'http://localhost:3000');
 * const listings = await client.getListings();
 * const seo = await client.getSEO('/');
 */

class AdminPlatformClient {
  constructor(apiKey, apiUrl = 'http://localhost:3000') {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  /**
   * Get all published listings for this site
   */
  async getListings() {
    try {
      const res = await fetch(`${this.apiUrl}/public/sites/${this.apiKey}/listings`);
      if (!res.ok) {
        throw new Error(`Failed to fetch listings: ${res.statusText}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw error;
    }
  }

  /**
   * Get all SEO settings for this site
   */
  async getAllSEO() {
    try {
      const res = await fetch(`${this.apiUrl}/public/sites/${this.apiKey}/seo`);
      if (!res.ok) {
        throw new Error(`Failed to fetch SEO settings: ${res.statusText}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching SEO settings:', error);
      throw error;
    }
  }

  /**
   * Get SEO settings for a specific page
   * @param {string} pagePath - The page path (e.g., '/', '/about', '/contact')
   */
  async getSEO(pagePath) {
    try {
      const encodedPath = encodeURIComponent(pagePath);
      const res = await fetch(`${this.apiUrl}/public/sites/${this.apiKey}/seo/${encodedPath}`);
      if (!res.ok) {
        if (res.status === 404) {
          return null; // No SEO settings for this page
        }
        throw new Error(`Failed to fetch SEO settings: ${res.statusText}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching SEO setting:', error);
      throw error;
    }
  }

  /**
   * Get listing by ID
   * Note: Listings don't have individual endpoints, get from getListings() instead
   */
  getListingById(id) {
    throw new Error('Use getListings() to fetch listings, then filter by id');
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdminPlatformClient;
}