import type { NextApiRequest, NextApiResponse } from 'next';
import { createRoom, getRoomsWithPhotos, deleteRoom } from '@/api/rooms';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const room = await createRoom(req.body);
      return res.status(201).json({ room });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
  if (req.method === 'GET') {
    try {
      const { propertyId } = req.query;
      if (!propertyId || typeof propertyId !== 'string') return res.status(400).json({ error: 'propertyId requis' });
      const rooms = await getRoomsWithPhotos(propertyId);
      return res.status(200).json(rooms);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
  if (req.method === 'DELETE') {
    try {
      const { roomId } = req.body;
      if (!roomId) return res.status(400).json({ error: 'roomId requis' });
      await deleteRoom(roomId);
      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
  return res.status(405).json({ error: 'Méthode non autorisée' });
} 