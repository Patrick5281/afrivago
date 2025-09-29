import { db } from '@/lib/db';

interface Property {
  id: string;
  title: string;
  property_type_id: string;
  statut: string;
  city: string;
  surface: number;
  created_at: string;
  created_by: string;
}

/**
 * Récupère toutes les propriétés d'un utilisateur
 */
export async function getUserProperties(userId: string): Promise<Property[]> {
  const pool = db.getPool();
  if (!pool) throw new Error('Erreur de connexion à la base de données');

  try {
    const result = await pool.query(
      `SELECT 
        p.id,
        p.title,
        p.property_type_id,
        p.statut,
        p.city,
        p.surface,
        p.created_at,
        p.created_by
      FROM properties p
      WHERE p.created_by = $1
      ORDER BY p.created_at DESC`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error('[ERROR] Erreur lors de la récupération des propriétés:', error);
    throw new Error('Erreur lors de la récupération de vos biens');
  }
}

/**
 * Met à jour une propriété
 */
export async function updateProperty(propertyId: string, updates: Partial<Property>): Promise<Property> {
  const pool = db.getPool();
  if (!pool) throw new Error('Erreur de connexion à la base de données');

  try {
    // Construire la requête de mise à jour dynamiquement
    const updateFields = Object.keys(updates)
      .filter(key => updates[key] !== undefined)
      .map((key, index) => `${key} = $${index + 2}`);

    const values = Object.values(updates).filter(value => value !== undefined);
    
    const query = `
      UPDATE properties 
      SET ${updateFields.join(', ')},
          updated_at = NOW()
      WHERE id = $1
      RETURNING *`;

    const result = await pool.query(query, [propertyId, ...values]);

    if (result.rows.length === 0) {
      throw new Error('Propriété non trouvée');
    }

    return result.rows[0];
  } catch (error) {
    console.error('[ERROR] Erreur lors de la mise à jour de la propriété:', error);
    throw new Error('Erreur lors de la mise à jour du bien');
  }
}

/**
 * Supprime une propriété
 */
export async function deleteProperty(propertyId: string): Promise<void> {
  const pool = db.getPool();
  if (!pool) throw new Error('Erreur de connexion à la base de données');

  try {
    const result = await pool.query(
      'DELETE FROM properties WHERE id = $1 RETURNING id',
      [propertyId]
    );

    if (result.rows.length === 0) {
      throw new Error('Propriété non trouvée');
    }
  } catch (error) {
    console.error('[ERROR] Erreur lors de la suppression de la propriété:', error);
    throw new Error('Erreur lors de la suppression du bien');
  }
}

/**
 * Met à jour le statut d'une propriété
 */
export async function updatePropertyStatus(propertyId: string, statut: string): Promise<Property> {
  const pool = db.getPool();
  if (!pool) throw new Error('Erreur de connexion à la base de données');

  try {
    const result = await pool.query(
      `UPDATE properties 
       SET statut = $2,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [propertyId, statut]
    );

    if (result.rows.length === 0) {
      throw new Error('Propriété non trouvée');
    }

    return result.rows[0];
  } catch (error) {
    console.error('[ERROR] Erreur lors de la mise à jour du statut:', error);
    throw new Error('Erreur lors de la mise à jour du statut');
  }
}

/**
 * Vérifie si un utilisateur est propriétaire d'un bien
 */
export async function verifyPropertyOwnership(propertyId: string, userId: string): Promise<boolean> {
  const pool = db.getPool();
  if (!pool) throw new Error('Erreur de connexion à la base de données');

  try {
    const result = await pool.query(
      'SELECT id FROM properties WHERE id = $1 AND created_by = $2',
      [propertyId, userId]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error('[ERROR] Erreur lors de la vérification de la propriété:', error);
    throw new Error('Erreur lors de la vérification des droits d\'accès');
  }
} 