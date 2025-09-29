import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.query.userId as string;
  console.log('[API][recommendations] userId reçu:', userId); // LOG 1
  if (!userId) return res.status(400).json({ error: 'userId requis' });

  try {
    const recommendations = await getRecommendedPropertiesForUser(userId, 10);
    res.status(200).json(recommendations);
  } catch (error) {
    console.error('[API][recommendations]', error);
    res.status(500).json({ error: (error as Error).message });
  }
}

async function getRecommendedPropertiesForUser(userId: string, limit: number = 10) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');

  // LOG 2: Récupérer et logger les préférences utilisateur
  const { rows: userPrefs } = await pool.query(`
    SELECT up.*, pr.label, pr.category
    FROM user_preferences up
    LEFT JOIN preferences pr ON pr.id = up.preference_id
    WHERE up.user_id = $1
  `, [userId]);
  console.log('[API][recommendations] Préférences utilisateur:', userPrefs);

  // LOG 3: Exécuter la requête de recommandations et logger le résultat
  const { rows } = await pool.query(`
    SELECT 
      p.*,
      pt.name AS property_type_name,
      prc.amount AS price_amount,
      prc.currency AS price_currency,
      (
        SELECT json_agg(pi) FROM property_images pi WHERE pi.property_id = p.id
      ) AS property_images,
      SUM(
        CASE 
          WHEN pr.category = 'zone' AND LOWER(p.city) = LOWER(pr.label) THEN up.preference_weight * 10
          WHEN pr.category = 'property_type' AND LOWER(pt.name) = LOWER(pr.label) THEN up.preference_weight * 5
          WHEN pr.category = 'budget' AND prc.amount BETWEEN split_part(pr.label, '-', 1)::int AND split_part(pr.label, '-', 2)::int THEN up.preference_weight * 2
          ELSE 0
        END
      ) AS score
    FROM properties p
    LEFT JOIN property_types pt ON pt.id = p.property_type_id
    LEFT JOIN user_preferences up ON up.user_id = $1
    LEFT JOIN preferences pr ON pr.id = up.preference_id
    LEFT JOIN property_pricing prc ON prc.property_id = p.id
    GROUP BY p.id, pt.name, prc.amount, prc.currency
    HAVING SUM(
      CASE 
        WHEN pr.category = 'zone' AND LOWER(p.city) = LOWER(pr.label) THEN up.preference_weight * 10
        WHEN pr.category = 'property_type' AND LOWER(pt.name) = LOWER(pr.label) THEN up.preference_weight * 5
        WHEN pr.category = 'budget' AND prc.amount BETWEEN split_part(pr.label, '-', 1)::int AND split_part(pr.label, '-', 2)::int THEN up.preference_weight * 2
        ELSE 0
      END
    ) > 0
    ORDER BY score DESC
    LIMIT $2
  `, [userId, limit]);
  console.log('[API][recommendations] Propriétés recommandées:', rows);
  console.log('[API][recommendations] Nombre de propriétés trouvées:', rows.length);
  return rows;
} 