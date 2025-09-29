import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'id requis' });
  }
  try {
    const { rows } = await query('SELECT id, name, surname, photourl, onboardingiscompleted FROM users WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur' });
  }
} 