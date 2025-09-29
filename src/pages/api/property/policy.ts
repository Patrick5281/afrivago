import type { NextApiRequest, NextApiResponse } from 'next';
import { 
  getPropertyTermsStatus, 
  updatePropertyTermsStatus, 
  activateProperty,
  getPropertyPricing,
  getActiveCommission 
} from '@/api/property-policy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // GET - Récupérer le statut des conditions, le prix ou la commission
    if (req.method === 'GET') {
      const { propertyId, type } = req.query;
      
      if (!propertyId || typeof propertyId !== 'string') {
        return res.status(400).json({ error: 'propertyId requis' });
      }

      // Récupérer le statut d'acceptation des conditions
      if (type === 'status') {
        const status = await getPropertyTermsStatus(propertyId);
        return res.status(200).json(status);
      }

      // Récupérer le prix de la propriété
      if (type === 'pricing') {
        const pricing = await getPropertyPricing(propertyId);
        return res.status(200).json(pricing);
      }

      // Récupérer la commission active
      if (type === 'commission') {
        const commission = await getActiveCommission();
        return res.status(200).json(commission);
      }

      return res.status(400).json({ error: 'type de requête inconnu' });
    }

    // PATCH - Mettre à jour l'acceptation des conditions
    if (req.method === 'PATCH') {
      const { propertyId, accepted } = req.body;

      if (!propertyId || typeof accepted !== 'boolean') {
        return res.status(400).json({ error: 'propertyId et accepted requis' });
      }

      await updatePropertyTermsStatus(propertyId, accepted);
      return res.status(200).json({ success: true });
    }

    // POST - Activer la propriété après acceptation des conditions
    if (req.method === 'POST') {
      const { propertyId } = req.body;

      if (!propertyId) {
        return res.status(400).json({ error: 'propertyId requis' });
      }

      await activateProperty(propertyId);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (error) {
    console.error('[ERROR] Erreur dans /api/property/policy:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur', 
      details: (error as Error).message 
    });
  }
} 