import type { NextApiRequest, NextApiResponse } from 'next';
import { getRoomsWithPhotos, updateRoom, deleteRoom, deleteRoomPhotos, updatePropertySurfaceAndDescription } from '@/api/property';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { propertyId } = req.query;
      if (!propertyId || typeof propertyId !== 'string') return res.status(400).json({ error: 'propertyId requis' });
      const rooms = await getRoomsWithPhotos(propertyId);
      return res.status(200).json(rooms);
    }
    if (req.method === 'PUT') {
      const room = req.body;
      await updateRoom(room);
      return res.status(200).json({ success: true });
    }
    if (req.method === 'DELETE') {
      const { roomId } = req.body;
      if (!roomId) return res.status(400).json({ error: 'roomId requis' });
      await deleteRoomPhotos(roomId);
      await deleteRoom(roomId);
      return res.status(200).json({ success: true });
    }
    if (req.method === 'PATCH') {
      const { propertyId, surface, description } = req.body;
      if (!propertyId) return res.status(400).json({ error: 'propertyId requis' });
      await updatePropertySurfaceAndDescription(propertyId, surface, description);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur', details: (error as Error).message });
  }
} 