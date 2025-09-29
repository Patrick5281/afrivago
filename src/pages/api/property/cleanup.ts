import type { NextApiRequest, NextApiResponse } from 'next';
import { propertyService } from '@/api/property';
import { publishProperty } from '@/api/property-final';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
  }

  const { propertyId } = req.body;

  if (!propertyId) {
    return res.status(400).json({ message: 'ID de propriété manquant' });
  }

  try {
    await propertyService.cleanupPropertyData(propertyId);
    await publishProperty(propertyId);
    return res.status(200).json({ message: 'Nettoyage et publication effectués avec succès' });
  } catch (error: any) {
    console.error('[ERROR] /api/property/cleanup:', error);
    return res.status(500).json({ message: error.message || 'Erreur lors du nettoyage des données' });
  }
} 