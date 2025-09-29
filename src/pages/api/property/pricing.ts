import type { NextApiRequest, NextApiResponse } from 'next';
import { getCurrencies, getActiveCommission, getPropertyPricing, upsertPropertyPricing } from '@/api/property';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { propertyId, type } = req.query;
      if (type === 'currencies') {
        const currencies = await getCurrencies();
        return res.status(200).json(currencies);
      }
      if (type === 'commission') {
        const commission = await getActiveCommission();
        return res.status(200).json(commission);
      }
      if (type === 'pricing') {
        if (!propertyId || typeof propertyId !== 'string') return res.status(400).json({ error: 'propertyId requis' });
        const pricing = await getPropertyPricing(propertyId);
        return res.status(200).json(pricing);
      }
      return res.status(400).json({ error: 'type de requête inconnu' });
    }
    if (req.method === 'PATCH') {
      const { propertyId, amount, currency } = req.body;
      if (!propertyId || typeof amount !== 'number' || !currency) return res.status(400).json({ error: 'propertyId, amount et currency requis' });
      await upsertPropertyPricing(propertyId, amount, currency);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur', details: (error as Error).message });
  }
} 