import type { NextApiRequest, NextApiResponse } from 'next';
import { PreferencesService } from '@/api/preferences';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { userId, preferences } = req.body;
    
    if (!userId || !preferences) {
      return res.status(400).json({ 
        error: 'ID utilisateur et préférences requis' 
      });
    }

    const { statut, zone, type_logement, budget_min, budget_max } = preferences;

    // Récupérer les IDs des préférences basés sur les valeurs
    const pool = db.getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Pool de connexion non initialisé' });
    }

    const preferenceIds: string[] = [];

    // Récupérer l'ID de la préférence statut
    if (statut) {
      const { rows } = await pool.query(
        'SELECT id FROM preferences WHERE label = $1 AND category = $2',
        [statut, 'status']
      );
      if (rows.length > 0) {
        preferenceIds.push(rows[0].id);
      }
    }

    // Récupérer l'ID de la préférence zone
    if (zone) {
      const { rows } = await pool.query(
        'SELECT id FROM preferences WHERE label = $1 AND category = $2',
        [zone, 'zone']
      );
      if (rows.length > 0) {
        preferenceIds.push(rows[0].id);
      }
    }

    // Récupérer l'ID de la préférence type de logement
    if (type_logement) {
      const { rows } = await pool.query(
        'SELECT id FROM preferences WHERE label = $1 AND category = $2',
        [type_logement, 'property_type']
      );
      if (rows.length > 0) {
        preferenceIds.push(rows[0].id);
      }
    }

    // Récupérer l'ID de la préférence budget (basé sur la fourchette)
    if (budget_min && budget_max) {
      // Trouver la tranche de budget qui correspond
      const budgetRange = `${budget_min}-${budget_max}`;
      const { rows } = await pool.query(
        'SELECT id FROM preferences WHERE label = $1 AND category = $2',
        [budgetRange, 'budget']
      );
      if (rows.length > 0) {
        preferenceIds.push(rows[0].id);
      }
    }

    // Sauvegarder toutes les préférences
    if (preferenceIds.length > 0) {
      await PreferencesService.saveUserPreferences(userId, preferenceIds);
    }

    return res.status(200).json({
      success: true,
      message: 'Préférences mises à jour avec succès',
      preferencesSaved: preferenceIds.length
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des préférences:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur lors de la mise à jour des préférences',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 