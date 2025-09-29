import type { NextApiRequest, NextApiResponse } from 'next';
import { resetPassword } from '@/api/authentication';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: 'Token et nouveau mot de passe requis' });
  }
  const { error } = await resetPassword(token, password);
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(200).json({ message: 'Mot de passe réinitialisé' });
} 