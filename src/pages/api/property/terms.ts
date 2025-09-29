import type { NextApiRequest, NextApiResponse } from 'next';
import { getTerms, getPropertyTerms, upsertPropertyTerms } from '@/api/property';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { propertyId } = req.query;
      console.log('[DEBUG] GET /api/property/terms - propertyId:', propertyId);

      const terms = await getTerms();
      let propertyTerms = null;

      if (propertyId && typeof propertyId === 'string') {
        propertyTerms = await getPropertyTerms(propertyId);
      }

      console.log('[DEBUG] Terms récupérés:', terms);
      console.log('[DEBUG] Property terms récupérés:', propertyTerms);

      return res.status(200).json({ terms, propertyTerms });
    }

    if (req.method === 'PATCH') {
      const { propertyId, payload } = req.body;
      console.log('[DEBUG] PATCH /api/property/terms - Données:', { propertyId, payload });

      if (!propertyId || typeof payload !== 'object') {
        console.error('[ERROR] Données invalides:', { propertyId, payload });
        return res.status(400).json({ error: 'propertyId et payload requis' });
      }

      await upsertPropertyTerms(propertyId, payload);
      console.log('[DEBUG] Property terms mis à jour avec succès');
      return res.status(200).json({ success: true });
    }

    console.error('[ERROR] Méthode non autorisée:', req.method);
    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (error) {
    console.error('[ERROR] Erreur dans /api/property/terms:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur', 
      details: (error as Error).message 
    });
  }
} 