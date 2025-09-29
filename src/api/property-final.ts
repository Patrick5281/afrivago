import { db } from '@/lib/db';

/**
 * Publie une propriété en mettant à jour son statut
 */
export async function publishProperty(propertyId: string): Promise<void> {
  const pool = db.getPool();
  if (!pool) {
    throw new Error('Erreur de connexion à la base de données');
  }

  try {
    // Mettre à jour le statut de la propriété
    const updateResult = await pool.query(
      `UPDATE properties 
       SET statut = 'publie',
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, statut`,
      [propertyId]
    );

    if (updateResult.rowCount === 0) {
      throw new Error('La mise à jour de la propriété a échoué');
    }
  } catch (error) {
    console.error('[ERROR] Erreur lors de la publication:', error);
    throw error;
  }
}

/**
 * Marque l'onboarding comme terminé pour un utilisateur
 */
export async function markUserOnboardingCompleted(userId: string): Promise<void> {
  const pool = db.getPool();
  console.log('[DEBUG] État du pool de connexion pour onboarding:', pool ? 'disponible' : 'non disponible');

  if (!pool) {
    console.error('[ERROR] Pool de connexion non initialisé pour onboarding');
    throw new Error('Erreur de connexion à la base de données');
  }

  try {
    console.log('[DEBUG] Marquage de l\'onboarding pour l\'utilisateur:', userId);

    // Vérifier si l'utilisateur existe
    const checkResult = await pool.query(
      'SELECT id, onboarding_completed FROM users WHERE id = $1',
      [userId]
    );

    if (checkResult.rows.length === 0) {
      throw new Error(`Utilisateur non trouvé avec l'ID: ${userId}`);
    }

    console.log('[DEBUG] État actuel de l\'utilisateur:', checkResult.rows[0]);

    // Mettre à jour le statut d'onboarding
    const updateResult = await pool.query(
      `UPDATE users 
       SET onboarding_completed = true,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, onboarding_completed`,
      [userId]
    );

    console.log('[DEBUG] Résultat de la mise à jour onboarding:', updateResult.rows[0]);

    if (updateResult.rowCount === 0) {
      throw new Error('La mise à jour du statut d\'onboarding a échoué');
    }

    console.log('[DEBUG] Onboarding marqué comme terminé avec succès');
  } catch (error) {
    console.error('[ERROR] Erreur détaillée lors de la mise à jour onboarding:', error);
    throw error; // Propager l'erreur avec les détails
  }
} 