import type { NextApiRequest, NextApiResponse } from 'next';
import { propertyService } from '@/api/property';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const formData = req.body;
      const property = await propertyService.createProperty(formData);
      console.log('[DEBUG] Propriété créée (API):', property);
      return res.status(201).json(property);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
  return res.status(405).json({ error: 'Méthode non autorisée' });
} 