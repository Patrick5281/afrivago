import type { NextApiRequest, NextApiResponse } from 'next';
import { getNonHabitableRoomTypes, getPropertyNonHabitableRooms, replacePropertyNonHabitableRooms } from '@/api/property';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { propertyId } = req.query;
      const roomTypes = await getNonHabitableRoomTypes();
      let propertyRooms = [];
      if (propertyId && typeof propertyId === 'string') {
        propertyRooms = await getPropertyNonHabitableRooms(propertyId);
      }
      return res.status(200).json({ roomTypes, propertyRooms });
    }
    if (req.method === 'PATCH') {
      const { propertyId, inserts } = req.body;
      if (!propertyId || !Array.isArray(inserts)) return res.status(400).json({ error: 'propertyId et inserts requis' });
      await replacePropertyNonHabitableRooms(propertyId, inserts);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur', details: (error as Error).message });
  }
} 