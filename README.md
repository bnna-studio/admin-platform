# Admin Platform

Multi-tenant SaaS admin dashboard for managing client websites.

## Project Structure

- **backend/** — Node.js + Express API
- **dashboard/** — React + Vite admin UI
- **cms-site/** — Demo client site consuming the public API

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (or use Neon/Supabase)

### Setup

```bash
# Install dependencies
npm install --workspaces

# Set up environment variables
cp backend/.env.example backend/.env
cp dashboard/.env.example dashboard/.env

# Run database migrations
cd backend && npx prisma migrate dev
cd ..

# Start development servers
npm run dev
```

Backend runs on `http://localhost:3000`
Dashboard runs on `http://localhost:5173`
Demo cms-site runs on `http://localhost:5174` (see `cms-site/README.md`)

## API Documentation

See `backend/README.md` for API endpoint docs.

## Database Schema

See `backend/prisma/schema.prisma` for the data model.