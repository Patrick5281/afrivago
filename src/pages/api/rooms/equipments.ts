import type { NextApiRequest, NextApiResponse } from 'next';
import { getPossibleEquipmentsForRoomType, saveRoomEquipments } from '@/api/equipments';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { roomTypeId } = req.query;
    if (!roomTypeId || typeof roomTypeId !== 'string') {
      return res.status(400).json({ error: 'roomTypeId requis' });
    }
    try {
      const equipments = await getPossibleEquipmentsForRoomType(roomTypeId);
      return res.status(200).json({ equipments });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    const { roomId, equipments } = req.body;
    if (!roomId || !equipments) {
      return res.status(400).json({ error: 'roomId et equipments requis' });
    }
    try {
      const result = await saveRoomEquipments(roomId, equipments);
      return res.status(200).json({ result });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
} 