import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseSignInUser } from '@/api/authentication';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-par-defaut';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }
  const { error, data } = await supabaseSignInUser(email, password);
  if (error) {
    return res.status(400).json({ error: error.message, code: error.code });
  }

  // Générer le JWT
  const token = jwt.sign(
    { id: data.id, email: data.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Poser le cookie auth_token
  res.setHeader('Set-Cookie', `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);

  return res.status(200).json({ user: data });
} 