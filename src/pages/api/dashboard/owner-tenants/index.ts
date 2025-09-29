import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const ownerId = user.id;
  const pool = db.getPool();
  if (!pool) return res.status(500).json({ error: 'DB non initialisée' });

  try {
    const { rows } = await pool.query(
      `SELECT
        r.id AS reservation_id,
        u.id AS locataire_id,
        u.name,
        u.surname,
        u.photourl,
        p.title AS bien_loue,
        r.start_date,
        r.end_date,
        pr.amount AS loyer,
        pr.currency,
        r.status AS statut_reservation
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN properties p ON r.property_id = p.id
      LEFT JOIN property_pricing pr ON pr.property_id = p.id
      WHERE p.created_by = $1
        AND r.status = 'validated'
      ORDER BY r.start_date DESC`,
      [ownerId]
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Erreur API locataires:', error);
    return res.status(500).json({ error: 'Erreur serveur', details: (error as Error).message });
  }
} 