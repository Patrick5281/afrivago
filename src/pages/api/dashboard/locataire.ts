import type { NextApiRequest, NextApiResponse } from 'next';
import { getDashboardLocataireData } from '@/scrapi/dashboard/locataire';
import { getSession } from '@/lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req);
  if (!session || !session.user?.id) {
    return res.status(401).json({ error: "Non authentifié" });
  }
  const userId = session.user.id;
  const data = await getDashboardLocataireData(userId);
  res.status(200).json(data);
} 