import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEmailToResetPassword } from '@/api/authentication';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email requis' });
  }
  const { error } = await sendEmailToResetPassword(email);
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(200).json({ message: 'Email envoyé' });
} 