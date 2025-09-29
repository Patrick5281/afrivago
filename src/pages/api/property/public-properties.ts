import { NextApiRequest, NextApiResponse } from 'next';
import { getPublicProperties } from '@/api/public-properties';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
  }

  try {
    const properties = await getPublicProperties();
    return res.status(200).json(properties);
  } catch (error: any) {
    console.error('[ERROR] Erreur dans public-properties:', error);
    return res.status(500).json({ 
      message: error.message || 'Erreur lors de la récupération des propriétés' 
    });
  }
} 