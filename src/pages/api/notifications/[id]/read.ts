import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { getSession } from '@/lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req);
  if (!session || !session.user?.id) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  const userId = session.user.id;
  const { id } = req.query;

  if (req.method === 'PATCH') {
    const result = await query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }
    return res.status(200).json(result.rows[0]);
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
} 