import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // À adapter selon ton système d'authentification
  const userId = req.headers['user-id'] as string; // ou récupère depuis le token/session

  if (!userId) {
    return res.status(401).json({ error: 'Utilisateur non authentifié' });
  }

  const pool = db.getPool();
  if (!pool) {
    return res.status(500).json({ error: 'Pool de connexion non initialisé' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, logement_nom, logement_adresse, date_arrivee, pdf_url
       FROM contrats_locatifs
       WHERE locataire_id = $1
       ORDER BY date_arrivee DESC`,
      [userId]
    );

    return res.status(200).json({ contrats: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des contrats' });
  }
} 