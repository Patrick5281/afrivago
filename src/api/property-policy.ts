import { db } from '@/lib/db';

/**
 * Récupère le statut d'acceptation des conditions pour une propriété
 */
export async function getPropertyTermsStatus(propertyId: string) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');

  try {
    console.log('[DEBUG] Récupération du statut des conditions pour propertyId:', propertyId);
    const { rows } = await pool.query(
      'SELECT terms_accepted, terms_accepted_at FROM properties WHERE id = $1',
      [propertyId]
    );
    
    console.log('[DEBUG] Statut des conditions récupéré:', rows[0]);
    return rows[0] || { terms_accepted: false, terms_accepted_at: null };
  } catch (error) {
    console.error('[ERROR] Erreur lors de la récupération du statut des conditions:', error);
    throw new Error('Erreur lors de la récupération du statut des conditions');
  }
}

/**
 * Met à jour le statut d'acceptation des conditions pour une propriété
 */
export async function updatePropertyTermsStatus(propertyId: string, accepted: boolean) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');

  try {
    console.log('[DEBUG] Mise à jour du statut des conditions pour propertyId:', propertyId);
    await pool.query(
      `UPDATE properties 
       SET terms_accepted = $1, 
           terms_accepted_at = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [accepted, accepted ? new Date().toISOString() : null, propertyId]
    );
    console.log('[DEBUG] Statut des conditions mis à jour avec succès');
  } catch (error) {
    console.error('[ERROR] Erreur lors de la mise à jour du statut des conditions:', error);
    throw new Error('Erreur lors de la mise à jour du statut des conditions');
  }
}

/**
 * Active une propriété après acceptation des conditions
 */
export async function activateProperty(propertyId: string) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');

  try {
    console.log('[DEBUG] Activation de la propriété:', propertyId);
    
    // Vérifier que les conditions ont été acceptées
    const { rows } = await pool.query(
      'SELECT terms_accepted FROM properties WHERE id = $1',
      [propertyId]
    );

    if (!rows[0]?.terms_accepted) {
      throw new Error('Les conditions générales doivent être acceptées avant l\'activation');
    }

    // Activer la propriété
    await pool.query(
      `UPDATE properties 
       SET status = 'publie',
           updated_at = NOW()
       WHERE id = $1`,
      [propertyId]
    );
    
    console.log('[DEBUG] Propriété activée avec succès');
  } catch (error) {
    console.error('[ERROR] Erreur lors de l\'activation de la propriété:', error);
    throw new Error('Erreur lors de l\'activation de la propriété');
  }
}

/**
 * Récupère le prix d'une propriété
 */
export async function getPropertyPricing(propertyId: string) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  const { rows } = await pool.query(
    'SELECT amount, currency FROM public.property_pricing WHERE property_id = $1 LIMIT 1',
    [propertyId]
  );
  return rows[0] || null;
}

/**
 * Récupère la commission active de la plateforme
 */
export async function getActiveCommission() {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  const { rows } = await pool.query(
    'SELECT id, percentage, is_active FROM public.platform_commission WHERE is_active = true ORDER BY created_at DESC LIMIT 1'
  );
  return rows[0] || null;
} 