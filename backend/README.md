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
- `GET /sites/:id` — Get site details

### Listings (Phase 2)
- `GET /sites/:id/listings`
- `POST /sites/:id/listings`
- `PUT /sites/:id/listings/:listingId`
- `DELETE /sites/:id/listings/:listingId`

### SEO (Phase 3)
- `GET /sites/:id/seo`
- `PUT /sites/:id/seo`

### Public API (Phase 4)
- `GET /public/sites/:apiKey/listings`
- `GET /public/sites/:apiKey/seo`