import { NextApiRequest, NextApiResponse } from 'next';
import { getUnitDetails } from '@/api/details-property';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'ID invalide' });
  }

  try {
    const unitDetails = await getUnitDetails(id);

    if (!unitDetails) {
      return res.status(404).json({ message: 'Unité locative non trouvée' });
    }

    return res.status(200).json(unitDetails);
  } catch (error: any) {
    console.error(`[ERROR] /api/units/${id}:`, error);
    return res.status(500).json({ 
      message: error.message || "Erreur lors de la récupération de l'unité locative" 
    });
  }
} 