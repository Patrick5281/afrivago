// src/pages/api/test-db.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getPool, testConnection } from '@/config/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Test de connexion
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return res.status(500).json({ 
        success: false, 
        message: 'Échec de la connexion à PostgreSQL' 
      });
    }

    // Test d'une requête simple
    const pool = getPool();
    const result = await pool.query('SELECT version(), NOW() as current_time');
    
    res.status(200).json({
      success: true,
      message: 'Connexion PostgreSQL réussie',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur test DB:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test de la base de données',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}