import type { NextApiRequest, NextApiResponse } from 'next';
import { unitService } from '@/api/unit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { propertyId } = req.query;
      if (!propertyId || typeof propertyId !== 'string') return res.status(400).json({ error: 'propertyId requis' });
      const units = await unitService.getPropertyUnitsWithPricing(propertyId);
      return res.status(200).json(units);
    }
    if (req.method === 'DELETE') {
      const { unitId } = req.body;
      if (!unitId) return res.status(400).json({ error: 'unitId requis' });
      await unitService.deleteUnit(unitId);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur', details: (error as Error).message });
  }
} 