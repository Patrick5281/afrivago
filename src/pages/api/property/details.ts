import { NextApiRequest, NextApiResponse } from 'next';
import { getPropertyDetails } from '@/api/property-details';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
  }
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID de propriété manquant ou invalide' });
  }
  try {
    const details = await getPropertyDetails(id);
    return res.status(200).json(details);
  } catch (error: any) {
    console.error('[ERROR] Erreur dans property/details:', error);
    return res.status(500).json({ message: error.message || 'Erreur lors de la récupération des détails' });
  }
} 