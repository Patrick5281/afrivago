import type { NextApiRequest, NextApiResponse } from 'next';
import { getPropertyDescription, updatePropertyDescription } from '@/api/property';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { propertyId } = req.query;
      console.log('[DEBUG] GET /api/property/description - propertyId:', propertyId);
      
      if (!propertyId || typeof propertyId !== 'string') {
        console.error('[ERROR] propertyId manquant ou invalide');
        return res.status(400).json({ error: 'propertyId requis' });
      }
      
      const description = await getPropertyDescription(propertyId);
      console.log('[DEBUG] Description récupérée:', description);
      
      return res.status(200).json({ description });
    }
    
    if (req.method === 'PATCH') {
      const { propertyId, description } = req.body;
      console.log('[DEBUG] PATCH /api/property/description - Données:', { propertyId, description });
      
      if (!propertyId || typeof description !== 'string') {
        console.error('[ERROR] Données invalides:', { propertyId, description });
        return res.status(400).json({ error: 'propertyId et description requis' });
      }
      
      await updatePropertyDescription(propertyId, description);
      console.log('[DEBUG] Description mise à jour avec succès');
      return res.status(200).json({ success: true });
    }
    
    console.error('[ERROR] Méthode non autorisée:', req.method);
    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (error) {
    console.error('[ERROR] Erreur dans /api/property/description:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur', 
      details: (error as Error).message 
    });
  }
} 