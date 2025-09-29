import { NextApiRequest, NextApiResponse } from 'next';
import { profileService } from '@/api/profile';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // On accepte l'id dans le body (pour usage custom sans NextAuth)
  const { id, ...updates } = req.body;
  // const session = await getServerSession(req, res, authOptions);
  // const userId = session?.user?.id || id;
  const userId = id;
  if (!userId) {
    return res.status(401).json({ error: 'id utilisateur requis' });
  }

  try {
    const updated = await profileService.updateProfile(userId, updates);
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur' });
  }
} 