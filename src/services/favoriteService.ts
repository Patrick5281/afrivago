import { db } from '@/lib/db';

// Récupérer les propriétés favorites d'un utilisateur
export async function getUserFavorites(userId: string) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  const { rows } = await pool.query(
    `SELECT p.*, 
            pi.url AS image_url, 
            pt.name AS property_type, 
            pp.amount AS price, 
            pp.currency
     FROM property_favorites pf
     JOIN properties p ON pf.property_id = p.id
     LEFT JOIN LATERAL (
       SELECT url FROM property_images WHERE property_id = p.id LIMIT 1
     ) pi ON true
     LEFT JOIN property_types pt ON p.property_type_id = pt.id
     LEFT JOIN property_pricing pp ON pp.property_id = p.id
     WHERE pf.user_id = $1`,
    [userId]
  );
  console.log('Résultat SQL favoris:', rows);
  return rows;
}

// Ajouter un favori
export async function addFavorite(userId: string, propertyId: string) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  await pool.query(
    `INSERT INTO property_favorites (user_id, property_id) VALUES ($1, $2)
     ON CONFLICT (user_id, property_id) DO NOTHING`,
    [userId, propertyId]
  );
  return { success: true };
}

// Supprimer un favori
export async function removeFavorite(userId: string, propertyId: string) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  await pool.query(
    `DELETE FROM property_favorites WHERE user_id = $1 AND property_id = $2`,
    [userId, propertyId]
  );
  return { success: true };
} 