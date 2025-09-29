import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseFetchRoles } from '@/api/authentication';
import { db } from '@/lib/db';

// --- ROUTE EXISTANTE : Récupérer tous les rôles (GET /api/auth/roles) ---
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Si on veut récupérer tous les rôles
  if (req.method === 'GET' && !req.query.userId) {
    const { data, error } = await supabaseFetchRoles();
    if (error) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des rôles' });
    }
    return res.status(200).json({ roles: data });
  }

  // --- NOUVEAU : Récupérer les rôles d'un utilisateur spécifique (GET /api/auth/roles?userId=...) ---
  if (req.method === 'GET' && req.query.userId) {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId requis' });
    }
    try {
      const pool = db.getPool();
      if (!pool) throw new Error('Pool de connexion non initialisé');
      const { rows } = await pool.query(
        `SELECT r.id, r.nom, r.description, ur.role_id
         FROM user_roles ur
         JOIN roles r ON ur.role_id = r.id
         WHERE ur.user_id = $1`,
        [userId]
      );
      return res.status(200).json({ roles: rows });
    } catch (error) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des rôles utilisateur' });
    }
  }

  // Si la méthode n'est pas gérée
  return res.status(405).json({ error: 'Méthode non autorisée' });
} 