import type { NextApiRequest, NextApiResponse } from 'next';
import { createRoom, updateRoom, getRoomsWithPhotos, deleteRoom } from '@/api/rooms';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { propertyId } = req.query;
      if (!propertyId || typeof propertyId !== 'string') return res.status(400).json({ error: 'propertyId requis' });
      const rooms = await getRoomsWithPhotos(propertyId);
      return res.status(200).json(rooms);
    }
    if (req.method === 'POST') {
      const room = req.body;
      const newRoom = await createRoom(room);
      return res.status(201).json(newRoom);
    }
    if (req.method === 'PUT') {
      const { roomId, room } = req.body;
      if (!roomId || !room) return res.status(400).json({ error: 'roomId et room requis' });
      const updatedRoom = await updateRoom(roomId, room);
      return res.status(200).json(updatedRoom);
    }
    if (req.method === 'DELETE') {
      const { roomId } = req.body;
      if (!roomId) return res.status(400).json({ error: 'roomId requis' });
      await deleteRoom(roomId);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur', details: (error as Error).message });
  }
} 