import type { NextApiRequest, NextApiResponse } from 'next';
import { unitService } from '@/api/unit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { property_id, name, description, price_per_month } = req.body;

  if (!property_id || !name) {
    return res.status(400).json({ error: 'property_id et name sont requis' });
  }

  try {
    const unit = await unitService.createUnit({
      property_id,
      name,
      description,
      price_per_month
    });
    return res.status(201).json(unit);
  } catch (error: any) {
    console.error('Erreur création unité:', error);
    return res.status(500).json({ error: error.message });
  }
} 