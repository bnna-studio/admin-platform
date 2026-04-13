import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// ──────────────────────────────────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// ──────────────────────────────────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes (to be implemented)
app.post('/auth/login', (req, res) => {
  res.json({ message: 'Login endpoint - TODO' });
});

app.post('/auth/register', (req, res) => {
  res.json({ message: 'Register endpoint - TODO' });
});

app.post('/auth/logout', (req, res) => {
  res.json({ message: 'Logout endpoint - TODO' });
});

// Protected routes (to be implemented)
app.get('/me', (req, res) => {
  res.json({ message: 'Get current user - TODO' });
});

app.get('/sites', (req, res) => {
  res.json({ message: 'List sites - TODO' });
});

// ──────────────────────────────────────────────────────────────────────────
// Error handling
// ──────────────────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ──────────────────────────────────────────────────────────────────────────
// Start server
// ──────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Admin Platform API running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});