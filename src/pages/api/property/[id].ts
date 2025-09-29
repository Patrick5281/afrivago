import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const pool = db.getPool();

  if (!pool) {
    return res.status(500).json({ error: 'Pool de connexion non initialisé' });
  }

  try {
    if (req.method === 'GET') {
      console.log('[DEBUG] GET /api/property/[id] - Recherche propriété:', id);
      
      const { rows } = await pool.query(
        `SELECT 
          id, title, property_type_id, country_id, city, district,
          postal_code, full_address, surface, year_built,
          description, latitude, longitude, created_by,
          created_at, updated_at, rental_type, statut,
          terms_accepted, terms_accepted_at
        FROM properties 
        WHERE id = $1`,
        [id]
      );

      if (rows.length === 0) {
        console.log('[DEBUG] Propriété non trouvée:', id);
        return res.status(404).json({ error: 'Propriété non trouvée' });
      }

      console.log('[DEBUG] Propriété trouvée:', rows[0]);
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'PUT') {
      const updates = req.body;
      console.log('[DEBUG] PUT /api/property/[id] - Mise à jour propriété:', id);
      console.log('[DEBUG] Données de mise à jour:', updates);

      const allowedFields = [
        'title', 'property_type_id', 'country_id', 'city', 'district',
        'postal_code', 'full_address', 'surface', 'year_built',
        'description', 'latitude', 'longitude', 'rental_type',
        'statut', 'terms_accepted'
      ];

      const updateFields = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .map((key, index) => `${key} = $${index + 2}`);

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'Aucun champ valide à mettre à jour' });
      }

      const values = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .map(key => updates[key]);

      const query = `
        UPDATE properties 
        SET ${updateFields.join(', ')},
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const { rows } = await pool.query(query, [id, ...values]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Propriété non trouvée' });
      }

      console.log('[DEBUG] Propriété mise à jour:', rows[0]);
      return res.status(200).json(rows[0]);
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (error) {
    console.error('[ERROR] Erreur dans /api/property/[id]:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      details: (error as Error).message
    });
  }
} 