import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { getSession } from '@/lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req);
  if (!session || !session.user?.id) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  const userId = session.user.id;

  if (req.method === 'GET') {
    // Liste paginée (optionnel: ?limit=20&offset=0)
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const result = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return res.status(200).json(result.rows);
  }

  if (req.method === 'POST') {
    const { type, title, message, data } = req.body;
    if (!type || !title || !message) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message, data) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, type, title, message, data || null]
    );
    const notification = result.rows[0];
    // Emission temps réel via Socket.io
    const io = res.socket?.server?.io;
    if (io) {
      io.to(`user:${userId}`).emit('notification', notification);
    }
    return res.status(201).json(notification);
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
} 