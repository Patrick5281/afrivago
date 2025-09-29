import type { NextApiRequest, NextApiResponse } from 'next';
import { unitService } from '@/api/unit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { propertyId } = req.query;

  if (!propertyId || typeof propertyId !== 'string') {
    return res.status(400).json({ error: 'ID de propriété requis' });
  }

  try {
    const isValid = await unitService.validateProperty(propertyId);
    return res.status(200).json({ isValid });
  } catch (error: any) {
    console.error('Erreur validation propriété:', error);
    return res.status(500).json({ error: error.message });
  }
} 