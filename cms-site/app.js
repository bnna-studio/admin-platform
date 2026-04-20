import { AdminPlatformClient } from './public-api-client.js';

async function loadConfig() {
  try {
    return await import('./config.js');
  } catch {
    return await import('./config.example.js');
  }
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((el) => {
    if (value == null || value === '') return;
    if (el.tagName === 'META' || el.tagName === 'LINK') {
      const attr = el.tagName === 'LINK' ? 'href' : 'content';
      el.setAttribute(attr, value);
    } else {
      el.textContent = value;
    }
  });
}

function applySEO(seoSetting, fallbackSiteName) {
  if (!seoSetting) return;
  const {
    metaTitle,
    metaDescription,
    canonicalUrl,
    ogImage
  } = seoSetting;

  if (metaTitle) {
    document.title = fallbackSiteName ? `${metaTitle} — ${fallbackSiteName}` : metaTitle;
  }
  setText('[data-seo="title"]', metaTitle);
  setText('[data-seo="description"]', metaDescription);
  setText('[data-seo="canonical"]', canonicalUrl);
  setText('[data-seo="og-image"]', ogImage);
  setText('[data-seo="og-title"]', metaTitle);
  setText('[data-seo="og-description"]', metaDescription);
}

function renderListings(listings) {
  const container = document.getElementById('listings');
  if (!container) return;

  if (!listings || listings.length === 0) {
    container.innerHTML = '<p class="empty">No published listings yet.</p>';
    return;
  }

  container.innerHTML = listings.map((l) => {
    const image = Array.isArray(l.images) && l.images.length > 0 ? l.images[0] : null;
    const price = typeof l.price === 'number'
      ? `$${l.price.toFixed(2)}`
      : '';
    return `
      <article class="listing-card">
        ${image ? `<div class="listing-image"><img src="${image}" alt="${escapeHtml(l.title)}" /></div>` : ''}
        <div class="listing-body">
          <h2>${escapeHtml(l.title)}</h2>
          ${price ? `<p class="price">${price}</p>` : ''}
          ${l.description ? `<p class="description">${escapeHtml(l.description)}</p>` : ''}
        </div>
      </article>
    `;
  }).join('');
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[c]);
}

function showStatus(message, tone = 'info') {
  const el = document.getElementById('status');
  if (!el) return;
  el.className = `status status-${tone}`;
  el.textContent = message;
}

function currentPagePath() {
  const path = window.location.pathname;
  if (path.endsWith('/about.html')) return '/about';
  return '/';
}

async function main() {
  const { API_KEY, API_URL } = await loadConfig();

  if (!API_KEY || API_KEY.startsWith('PASTE_')) {
    showStatus(
      'Configure API_KEY in cms-site/config.js (copy from config.example.js).',
      'warning'
    );
    return;
  }

  const client = new AdminPlatformClient(API_KEY, API_URL);
  const pagePath = currentPagePath();

  try {
    const [listingsRes, seoRes] = await Promise.all([
      pagePath === '/' ? client.getListings() : Promise.resolve(null),
      client.getSEO(pagePath)
    ]);

    const siteName = seoRes?.site?.name || listingsRes?.site?.name;
    if (siteName) {
      document.querySelectorAll('[data-site-name]').forEach((el) => {
        el.textContent = siteName;
      });
    }

    applySEO(seoRes?.seoSetting, siteName);

    if (listingsRes) {
      renderListings(listingsRes.listings);
    }
  } catch (err) {
    console.error(err);
    showStatus(`Failed to load site data: ${err.message}`, 'error');
  }
}

main();
