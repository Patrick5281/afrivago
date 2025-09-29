import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { reservationId } = req.query;
  if (!reservationId || typeof reservationId !== 'string') {
    return res.status(400).json({ error: 'reservationId requis' });
  }
  const pool = db.getPool();
  if (!pool) return res.status(500).json({ error: 'DB non initialisée' });

  try {
    const { rows } = await pool.query(
      `SELECT
        p.id AS paiement_id,
        p.amount,
        p.currency,
        p.status,
        p.period,
        p.created_at
      FROM paiements p
      WHERE p.reservation_id = $1
        AND p.type = 'monthly'
      ORDER BY p.period ASC`,
      [reservationId]
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Erreur API paiements mensuels:', error);
    return res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
} 