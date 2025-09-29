import type { NextApiRequest, NextApiResponse } from 'next';
import { unitService } from '@/api/unit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: Récupérer la commission et les devises
  if (req.method === 'GET') {
    try {
      const [commission, currencies] = await Promise.all([
        unitService.getActiveCommission(),
        unitService.getCurrencies()
      ]);
      return res.status(200).json({ commission, currencies });
    } catch (error: any) {
      console.error('Erreur récupération données pricing:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // POST: Mettre à jour le pricing d'une unité et de sa propriété
  if (req.method === 'POST') {
    const { unitId, propertyId, price_per_month, currency, commission } = req.body;

    if (!unitId || !propertyId || !price_per_month || !currency) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    try {
      // 1. Mettre à jour le prix de l'unité
      await unitService.updateUnitPricing(unitId, { price_per_month, currency });

      // 2. Récupérer toutes les unités de la propriété
      const units = await unitService.getPropertyUnitsWithPricing(propertyId);

      // 3. Calculer le prix total net (après commission)
      const totalNet = units.reduce((sum, unit) => {
        const netPrice = unit.price_per_month - (unit.price_per_month * commission / 100);
        return sum + netPrice;
      }, 0);

      // 4. Mettre à jour le prix total de la propriété
      await unitService.updatePropertyPricing(propertyId, totalNet);

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Erreur mise à jour pricing:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
} 