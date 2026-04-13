import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

// Hash password
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password with hash
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Sign JWT token
export function signToken(userId, organizationId) {
  return jwt.sign(
    { userId, organizationId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
