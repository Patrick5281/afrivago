import { getUserFromRequest } from '@/utils/auth';
import { getUserFavorites, addFavorite } from '@/services/favoriteService';

export default async function handler(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const properties = await getUserFavorites(user.id);
    return res.status(200).json(properties);
  }

  if (req.method === 'POST') {
    const { propertyId } = req.body;
    if (!propertyId) return res.status(400).json({ error: 'propertyId required' });
    await addFavorite(user.id, propertyId);
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
} 