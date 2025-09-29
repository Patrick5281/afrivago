import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-par-defaut';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  try {
    const user = jwt.verify(token, JWT_SECRET) as { id: string, email: string };
    // Récupérer le userDocument depuis la base
    const pool = db.getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Pool de connexion non initialisé' });
    }
    
    // Récupérer les informations de base de l'utilisateur
    const { rows: userRows } = await pool.query(
      `SELECT name, surname, photourl, onboardingiscompleted FROM users WHERE id = $1`,
      [user.id]
    );
    
    // Récupérer les préférences de l'utilisateur
    const { rows: preferenceRows } = await pool.query(`
      SELECT 
        p.label,
        p.category
      FROM user_preferences up
      JOIN preferences p ON up.preference_id = p.id
      WHERE up.user_id = $1
    `, [user.id]);

    // Organiser les préférences par catégorie
    const preferences = preferenceRows.reduce((acc: any, row: any) => {
      if (!acc[row.category]) {
        acc[row.category] = [];
      }
      acc[row.category].push(row.label);
      return acc;
    }, {});

    // Construire le userDocument avec les préférences
    const userDocument = {
      ...userRows[0],
      // Préférences organisées
      statut: preferences.status?.[0] || null,
      zone: preferences.zone?.[0] || null,
      type_logement: preferences.property_type?.[0] || null,
      // Pour le budget, on récupère la tranche et on l'analyse
      budget_min: null,
      budget_max: null
    };

    // Analyser la tranche de budget si elle existe
    if (preferences.budget?.[0]) {
      const budgetRange = preferences.budget[0];
      const [min, max] = budgetRange.split('-').map(Number);
      if (!isNaN(min)) userDocument.budget_min = min;
      if (!isNaN(max)) userDocument.budget_max = max;
    }

    return res.status(200).json({ 
      user: { 
        ...user, 
        userDocument 
      } 
    });
  } catch (e) {
    return res.status(401).json({ error: 'Token invalide' });
  }
} 