# cms-site — Demo client site

A minimal static site that consumes the Admin Platform public API. Use it as a
starting point for real client sites or as a reference when building your own
integrations.

## How it works

- `public-api-client.js` — tiny ES-module wrapper around the public endpoints
  (`/public/sites/:apiKey/listings`, `/public/sites/:apiKey/seo`,
  `/public/sites/:apiKey/seo/:pagePath`).
- `app.js` — reads `config.js`, fetches published listings and per-page SEO, and
  renders them into the page. SEO values are applied to `<title>`, meta tags,
  OG tags, and canonical URL via `data-seo="…"` hooks.
- `index.html` / `about.html` — example pages. The page path is mapped to a
  stored SEO record (`/` and `/about`).

## Configure

1. In the admin dashboard, open the **Sites** tab and copy the site's public
   API key.
2. In this directory:

   ```bash
   cp config.example.js config.js
   ```

3. Edit `config.js` and set `API_KEY` and (if needed) `API_URL`.

## Run

From the repository root:

```bash
npm run dev --workspace cms-site
```

Or from this directory:

```bash
npm start
```

The site will be available at http://localhost:5174.

## Customize

- Add more HTML pages and extend `currentPagePath()` in `app.js` to map them to
  SEO records.
- Replace `renderListings()` with your own markup/templating.
- Drop `public-api-client.js` into any framework (Next.js, Astro, SvelteKit,
  etc.) — it's plain `fetch` under the hood.
