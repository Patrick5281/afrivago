import type { NextApiRequest, NextApiResponse } from 'next';
import { getCountries } from '@/api/property';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' });
  try {
    const countries = await getCountries();
    return res.status(200).json({ countries });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
} 