import { getUserFromRequest } from '@/utils/auth';
import { removeFavorite } from '@/services/favoriteService';

export default async function handler(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'DELETE') {
    const { propertyId } = req.query;
    if (!propertyId) return res.status(400).json({ error: 'propertyId required' });
    await removeFavorite(user.id, propertyId as string);
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
} 