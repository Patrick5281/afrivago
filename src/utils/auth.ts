import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-par-defaut';

export function getUserFromRequest(req: any) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/auth_token=([^;]+)/);
  if (!match) return null;
  try {
    const decoded = jwt.verify(match[1], JWT_SECRET);
    return decoded; // { id, email }
  } catch {
    return null;
  }
} 