# Admin Platform Dashboard

React + Vite dashboard UI for the admin platform.

## Setup

```bash
npm install
cp .env.example .env
```

## Development

```bash
npm run dev
```

Dashboard runs on `http://localhost:5173`

## API Client

The dashboard communicates with the backend API at `http://localhost:3000` (configurable via `VITE_API_URL`).

## Project Structure

```
src/
├── App.jsx          — Main app component
├── App.css
├── index.css        — Global styles
├── main.jsx         — Entry point
├── pages/           — Page components (to be created)
├── components/      — Reusable components (to be created)
└── api/             — API client helpers (to be created)
```

## Next Steps

- [ ] Login page
- [ ] Dashboard layout
- [ ] Listings management
- [ ] SEO management