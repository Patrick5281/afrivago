import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'id requis' });
  }
  try {
    // Récupérer les données utilisateur + pièces justificatives
    const { rows } = await query(`
      SELECT 
        u.id, 
        u.name, 
        u.surname, 
        u.photourl, 
        u.onboardingiscompleted,
        pj.type_piece_id,
        pj.numero_piece,
        pj.fichier_piece,
        pj.titre_foncier
      FROM users u
      LEFT JOIN piecesjustificatifs pj ON u.id = pj.user_id
      WHERE u.id = $1
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    console.log('[API] Données récupérées:', rows[0]);
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('[API] Erreur:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
} 