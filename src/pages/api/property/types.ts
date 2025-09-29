import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { updatePropertyType } from '@/api/property';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pool = db.getPool();
  if (!pool) {
    return res.status(500).json({ error: 'Pool de connexion non initialisé' });
  }

  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM property_types ORDER BY name');
      res.status(200).json(rows);
    } 
    else if (req.method === 'PUT') {
      const { propertyId, propertyTypeId } = req.body;
      
      console.log('[DEBUG] Requête PUT reçue:', { propertyId, propertyTypeId });
      
      if (!propertyId || !propertyTypeId) {
        return res.status(400).json({ 
          error: 'propertyId et propertyTypeId sont requis',
          received: { propertyId, propertyTypeId }
        });
      }

      // Vérifier que la propriété existe
      const propertyCheck = await pool.query('SELECT id FROM properties WHERE id = $1', [propertyId]);
      if (propertyCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Propriété non trouvée' });
      }

      // Vérifier que le type de propriété existe
      const typeCheck = await pool.query('SELECT id FROM property_types WHERE id = $1', [propertyTypeId]);
      if (typeCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Type de propriété non trouvé' });
      }

      await updatePropertyType(propertyId, propertyTypeId);
      
      console.log('[DEBUG] Type de propriété mis à jour avec succès');
      res.status(200).json({ 
        success: true, 
        message: 'Type de propriété mis à jour avec succès' 
      });
    } 
    else {
      return res.status(405).json({ error: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('[ERROR] /api/property/types:', error);
    
    // Renvoyer un message d'erreur plus détaillé
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    res.status(500).json({ 
      error: 'Erreur lors de l\'opération sur les types de propriété',
      details: errorMessage
    });
  }
}