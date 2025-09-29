import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { deleteRoom } from '@/api/rooms';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'id requis' });

  if (req.method === 'PUT') {
    try {
      const { name, room_type_id, surface, description } = req.body;
      const pool = db.getPool();
      await pool.query(
        'UPDATE rooms SET name = $1, room_type_id = $2, surface = $3, description = $4 WHERE id = $5',
        [name, room_type_id, surface, description, id]
      );
      const { rows } = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);
      return res.status(200).json({ room: rows[0] });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await deleteRoom(id);
      return res.status(200).json({ success: true });
  } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
} 