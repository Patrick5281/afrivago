import { NextApiRequest, NextApiResponse } from 'next';
import { publishProperty } from '@/api/property-final';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({ 
        message: 'propertyId est requis' 
      });
    }

    // Publier la propriété
      await publishProperty(propertyId);

    return res.status(200).json({ 
      message: 'Propriété publiée avec succès' 
    });
  } catch (error: any) {
    console.error('[ERROR] Erreur dans final-step:', error);
    return res.status(500).json({ 
      message: error.message || 'Erreur lors de la publication' 
    });
  }
} 