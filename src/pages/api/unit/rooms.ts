import type { NextApiRequest, NextApiResponse } from 'next';
import { unitService } from '@/api/unit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { unitId } = req.query;
      if (!unitId || typeof unitId !== 'string') return res.status(400).json({ error: 'unitId requis' });
      const rooms = await unitService.getRoomsByUnit(unitId);
      return res.status(200).json(rooms);
    }
    if (req.method === 'POST') {
      console.log('[DEBUG][API] Données reçues pour création pièce:', req.body);
      const { rental_unit_id, name, surface, description, room_type_id } = req.body;
      if (!rental_unit_id || !name) return res.status(400).json({ error: 'rental_unit_id et name requis' });
      const room = await unitService.createRoomForUnit({ rental_unit_id, name, surface, description, room_type_id });
      return res.status(201).json(room);
    }
    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (error) {
    console.error('[ERROR][API] Erreur création pièce:', error);
    return res.status(500).json({ error: 'Erreur serveur', details: (error as Error).message });
  }
} 