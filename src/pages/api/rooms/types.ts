import type { NextApiRequest, NextApiResponse } from 'next';
import { getRoomTypes } from '@/api/equipments';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' });
  try {
    console.log('[DEBUG] Récupération des types de pièces');
    const types = await getRoomTypes();
    console.log('[DEBUG] Types récupérés:', types);
    return res.status(200).json({ types });
  } catch (error: any) {
    console.error('[ERROR] Erreur lors de la récupération des types:', error);
    return res.status(500).json({ error: error.message });
  }
} 