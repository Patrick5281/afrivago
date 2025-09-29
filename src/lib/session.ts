import { NextApiRequest } from 'next';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-par-defaut';

interface DecodedToken {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

export async function getSession(req: NextApiRequest) {
  const token = req.cookies.auth_token;

  if (!token) {
    return null;
  }

  try {
    const decoded = verify(token, JWT_SECRET) as DecodedToken;
    return {
      user: {
        id: decoded.id,
        email: decoded.email,
      },
    };
  } catch (error) {
    // Le token est invalide ou a expiré
    return null;
  }
} 