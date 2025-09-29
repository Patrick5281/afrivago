import type { NextApiRequest, NextApiResponse } from 'next';
import { getPropertyTypeName, getRoomTypes, updateRentalType } from '@/api/property';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { propertyId, type } = req.query;
      if (!propertyId || typeof propertyId !== 'string') return res.status(400).json({ error: 'propertyId requis' });
      if (type === 'propertyTypeName') {
        const name = await getPropertyTypeName(propertyId);
        return res.status(200).json({ name });
      }
      if (type === 'roomTypes') {
        const roomTypes = await getRoomTypes();
        return res.status(200).json(roomTypes);
      }
      return res.status(400).json({ error: 'type de requête inconnu' });
    }
    if (req.method === 'PATCH') {
      const { propertyId, rentalType } = req.body;
      if (!propertyId || !rentalType) return res.status(400).json({ error: 'propertyId et rentalType requis' });
      await updateRentalType(propertyId, rentalType);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur', details: (error as Error).message });
  }
} 