# Admin Platform Backend

Express.js API for the multi-tenant admin platform.

## Setup

```bash
npm install
cp .env.example .env
# Update .env with your database URL
npx prisma migrate dev
```

## Development

```bash
npm run dev
```

Server runs on `http://localhost:3000`

## Database

Uses PostgreSQL with Prisma ORM.

### Migrations

Create a migration:
```bash
npx prisma migrate dev --name <name>
```

View database in Prisma Studio:
```bash
npx prisma studio
```

## API Endpoints

### Auth
- `POST /auth/login` — Login with email/password
- `POST /auth/register` — Create new organization + user
- `POST /auth/logout` — Logout

### User
- `GET /me` — Get current user

### Sites
- `GET /sites` — List sites for organization
- `GET /sites/:siteId` — Get site details
- `POST /sites` — Create a site
- `PUT /sites/:siteId` — Update a site
- `DELETE /sites/:siteId` — Delete a site
- `POST /sites/:siteId/rotate-api-key` — Rotate the public API key

### Listings (Phase 2)
- `GET /sites/:siteId/listings`
- `POST /sites/:siteId/listings`
- `PUT /sites/:siteId/listings/:listingId`
- `DELETE /sites/:siteId/listings/:listingId`

### SEO (Phase 3)
- `GET /sites/:siteId/seo`
- `POST /sites/:siteId/seo`
- `PUT /sites/:siteId/seo/:seoId`
- `DELETE /sites/:siteId/seo/:seoId`

### Public API (Phase 4)
- `GET /public/sites/:apiKey/listings`
- `GET /public/sites/:apiKey/seo`
- `GET /public/sites/:apiKey/seo/:pagePath`