import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, signToken, verifyToken } from './utils/auth.js';

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

// Auth middleware - extract JWT from Authorization header
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.slice(7);
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
}

// ──────────────────────────────────────────────────────────────────────────
// Routes - Public
// ──────────────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Register - Create new organization + user
app.post('/auth/register', async (req, res) => {
  try {
    const { orgName, orgSlug, email, password, displayName } = req.body;

    // Validate input
    if (!orgName || !orgSlug || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if org slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: orgSlug }
    });
    if (existingOrg) {
      return res.status(400).json({ error: 'Organization slug already taken' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create organization and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: orgName,
          slug: orgSlug
        }
      });

      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          displayName,
          role: 'owner', // First user is owner
          organizationId: org.id
        }
      });

      return { org, user };
    });

    // Generate token
    const token = signToken(result.user.id, result.org.id);

    res.status(201).json({
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        displayName: result.user.displayName,
        role: result.user.role,
        organizationId: result.org.id
      },
      organization: {
        id: result.org.id,
        name: result.org.name,
        slug: result.org.slug
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const passwordMatch = await comparePassword(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = signToken(user.id, user.organizationId);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        organizationId: user.organizationId
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        slug: user.organization.slug
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ──────────────────────────────────────────────────────────────────────────
// Routes - Protected (require authentication)
// ──────────────────────────────────────────────────────────────────────────

// Get current user
app.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { organization: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        organizationId: user.organizationId
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        slug: user.organization.slug
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// List sites for organization
app.get('/sites', authMiddleware, async (req, res) => {
  try {
    const sites = await prisma.site.findMany({
      where: { organizationId: req.user.organizationId }
    });

    res.json({ sites });
  } catch (error) {
    console.error('Get sites error:', error);
    res.status(500).json({ error: 'Failed to get sites' });
  }
});

// ──────────────────────────────────────────────────────────────────────────
// Listings API
// ──────────────────────────────────────────────────────────────────────────

// Get all listings for a site
app.get('/sites/:siteId/listings', authMiddleware, async (req, res) => {
  try {
    const { siteId } = req.params;

    // Verify site belongs to user's organization
    const site = await prisma.site.findUnique({
      where: { id: siteId }
    });

    if (!site || site.organizationId !== req.user.organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const listings = await prisma.listing.findMany({
      where: { siteId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ listings });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ error: 'Failed to get listings' });
  }
});

// Create listing
app.post('/sites/:siteId/listings', authMiddleware, async (req, res) => {
  try {
    const { siteId } = req.params;
    const { title, description, price, images, status } = req.body;

    // Verify site belongs to user's organization
    const site = await prisma.site.findUnique({
      where: { id: siteId }
    });

    if (!site || site.organizationId !== req.user.organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: price ? parseFloat(price) : null,
        images: images || [],
        status: status || 'draft',
        siteId
      }
    });

    res.status(201).json({ listing });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Update listing
app.put('/sites/:siteId/listings/:listingId', authMiddleware, async (req, res) => {
  try {
    const { siteId, listingId } = req.params;
    const { title, description, price, images, status } = req.body;

    // Verify site belongs to user's organization
    const site = await prisma.site.findUnique({
      where: { id: siteId }
    });

    if (!site || site.organizationId !== req.user.organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const listing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        title,
        description,
        price: price ? parseFloat(price) : null,
        images,
        status
      }
    });

    res.json({ listing });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// Delete listing
app.delete('/sites/:siteId/listings/:listingId', authMiddleware, async (req, res) => {
  try {
    const { siteId, listingId } = req.params;

    // Verify site belongs to user's organization
    const site = await prisma.site.findUnique({
      where: { id: siteId }
    });

    if (!site || site.organizationId !== req.user.organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.listing.delete({
      where: { id: listingId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// ──────────────────────────────────────────────────────────────────────────
// SEO Settings API
// ──────────────────────────────────────────────────────────────────────────

// Get all SEO settings for a site
app.get('/sites/:siteId/seo', authMiddleware, async (req, res) => {
  try {
    const { siteId } = req.params;

    // Verify site belongs to user's organization
    const site = await prisma.site.findUnique({
      where: { id: siteId }
    });

    if (!site || site.organizationId !== req.user.organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const seoSettings = await prisma.sEOSettings.findMany({
      where: { siteId },
      orderBy: { pagePath: 'asc' }
    });

    res.json({ seoSettings });
  } catch (error) {
    console.error('Get SEO settings error:', error);
    res.status(500).json({ error: 'Failed to get SEO settings' });
  }
});

// Create SEO settings for a page
app.post('/sites/:siteId/seo', authMiddleware, async (req, res) => {
  try {
    const { siteId } = req.params;
    const { pagePath, metaTitle, metaDescription, ogImage, canonicalUrl } = req.body;

    if (!pagePath) {
      return res.status(400).json({ error: 'Page path is required' });
    }

    // Verify site belongs to user's organization
    const site = await prisma.site.findUnique({
      where: { id: siteId }
    });

    if (!site || site.organizationId !== req.user.organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const seoSetting = await prisma.sEOSettings.create({
      data: {
        pagePath,
        metaTitle,
        metaDescription,
        ogImage,
        canonicalUrl,
        siteId
      }
    });

    res.status(201).json({ seoSetting });
  } catch (error) {
    console.error('Create SEO settings error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'SEO settings for this page already exist' });
    }
    res.status(500).json({ error: 'Failed to create SEO settings' });
  }
});

// Update SEO settings
app.put('/sites/:siteId/seo/:seoId', authMiddleware, async (req, res) => {
  try {
    const { siteId, seoId } = req.params;
    const { pagePath, metaTitle, metaDescription, ogImage, canonicalUrl } = req.body;

    // Verify site belongs to user's organization
    const site = await prisma.site.findUnique({
      where: { id: siteId }
    });

    if (!site || site.organizationId !== req.user.organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const seoSetting = await prisma.sEOSettings.update({
      where: { id: seoId },
      data: {
        pagePath,
        metaTitle,
        metaDescription,
        ogImage,
        canonicalUrl
      }
    });

    res.json({ seoSetting });
  } catch (error) {
    console.error('Update SEO settings error:', error);
    res.status(500).json({ error: 'Failed to update SEO settings' });
  }
});

// Delete SEO settings
app.delete('/sites/:siteId/seo/:seoId', authMiddleware, async (req, res) => {
  try {
    const { siteId, seoId } = req.params;

    // Verify site belongs to user's organization
    const site = await prisma.site.findUnique({
      where: { id: siteId }
    });

    if (!site || site.organizationId !== req.user.organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.sEOSettings.delete({
      where: { id: seoId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete SEO settings error:', error);
    res.status(500).json({ error: 'Failed to delete SEO settings' });
  }
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
