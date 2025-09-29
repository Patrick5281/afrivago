import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID manquant ou invalide' });
    }
    try {
      await query('DELETE FROM rooms WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('[API][DELETE][room]', error);
      return res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
  }
  res.setHeader('Allow', ['DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 