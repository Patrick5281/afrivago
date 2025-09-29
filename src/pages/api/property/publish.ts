import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

async function cleanupAndPublish(propertyId: string) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Récupérer le rental_type
    const propertyRes = await client.query('SELECT rental_type FROM properties WHERE id = $1', [propertyId]);
    if (propertyRes.rows.length === 0) {
      throw new Error('Propriété non trouvée');
    }
    const rentalType = propertyRes.rows[0].rental_type;

    // 2. Nettoyage conditionnel
    if (rentalType === 'entire') {
      console.log(`[PUBLISH-CLEANUP] Propriété ${propertyId} est 'entire'. Suppression des unités.`);
      await client.query(`DELETE FROM rooms WHERE rental_unit_id IN (SELECT id FROM rental_units WHERE property_id = $1)`, [propertyId]);
      await client.query(`DELETE FROM rental_units WHERE property_id = $1`, [propertyId]);
    } else if (rentalType === 'unit') {
      console.log(`[PUBLISH-CLEANUP] Propriété ${propertyId} est 'unit'. Suppression des pièces générales.`);
      await client.query(`DELETE FROM rooms WHERE property_id = $1 AND rental_unit_id IS NULL`, [propertyId]);
    }

    // 3. Mettre à jour le statut à 'published'
    console.log(`[PUBLISH] Publication de la propriété ${propertyId}`);
    await client.query(`UPDATE properties SET statut = 'published', updated_at = NOW() WHERE id = $1`, [propertyId]);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[ERROR] Erreur lors de la publication et du nettoyage:', error);
    throw new Error('Erreur interne du serveur lors de la publication.');
  } finally {
    client.release();
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
  }

  const { propertyId } = req.body;

  if (!propertyId) {
    return res.status(400).json({ message: 'ID de propriété manquant' });
  }

  try {
    await cleanupAndPublish(propertyId);
    return res.status(200).json({ message: 'Bien publié avec succès' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
} 