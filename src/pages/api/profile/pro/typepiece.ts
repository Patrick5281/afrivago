import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[API] === DÉBUT /api/profile/pro/typepiece ===');
  console.log('[API] Méthode:', req.method);
  console.log('[API] URL:', req.url);
  
  if (req.method !== 'GET') {
    console.log('[API] Méthode non autorisée:', req.method);
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    console.log('[API] Vérification des variables d\'environnement DB:');
    console.log('[API] POSTGRES_HOST:', process.env.POSTGRES_HOST || 'localhost (default)');
    console.log('[API] POSTGRES_DB:', process.env.POSTGRES_DB || 'app_db (default)');
    console.log('[API] POSTGRES_USER:', process.env.POSTGRES_USER || 'postgres (default)');
    console.log('[API] POSTGRES_PORT:', process.env.POSTGRES_PORT || '5432 (default)');
    console.log('[API] POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD ? '***défini***' : 'P@tr2004 (default)');

    console.log('[API] Test de connexion à la base de données...');
    
    // Test de connexion simple
    try {
      const testResult = await db.query('SELECT NOW() as current_time');
    } catch (dbError) {
      return res.status(500).json({ 
        error: 'Erreur de connexion à la base de données',
        details: dbError instanceof Error ? dbError.message : 'Erreur inconnue'
      });
    }

    console.log('[API] Vérification de l\'existence de la table typepiece...');
    
    // Vérifier si la table existe
    try {
      const tableCheck = await db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'typepiece'
        ) as table_exists
      `);
      
      const tableExists = tableCheck.rows[0]?.table_exists;
      console.log('[API] Table typepiece existe:', tableExists);
      
      if (!tableExists) {
        return res.status(500).json({ 
          error: 'Table typepiece n\'existe pas dans la base de données'
        });
      }
    } catch (tableError) {
      console.error('[API] ❌ Erreur lors de la vérification de la table:', tableError);
      return res.status(500).json({ 
        error: 'Erreur lors de la vérification de la table',
        details: tableError instanceof Error ? tableError.message : 'Erreur inconnue'
      });
    }

    console.log('[API] Vérification de la structure de la table...');
    
    // Vérifier la structure de la table
    try {
      const structureCheck = await db.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'typepiece' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      
      console.log('[API] Structure de la table typepiece:');
      structureCheck.rows.forEach(col => {
        console.log(`[API]   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } catch (structureError) {
      console.error('[API] ❌ Erreur lors de la vérification de la structure:', structureError);
    }

    console.log('[API] Récupération des types de pièce...');
    
    const result = await db.query(
      `SELECT id, labelle AS label
       FROM typepiece 
       ORDER BY labelle ASC`
    );

    console.log('[API] ✅ Types de pièce récupérés avec succès');
    console.log('[API] Nombre de résultats:', result.rows.length);
    console.log('[API] Premiers résultats:', result.rows.slice(0, 3));
    
    return res.status(200).json(result.rows);
    
  } catch (error) {
    console.error('[API] ❌ ERREUR CRITIQUE lors de la récupération des types de pièce:');
    console.error('[API] Type d\'erreur:', error?.constructor?.name);
    console.error('[API] Message d\'erreur:', error instanceof Error ? error.message : error);
    console.error('[API] Stack trace:', error instanceof Error ? error.stack : 'Pas de stack trace');
    console.error('[API] Erreur complète:', error);
    
    return res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des types de pièce',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
      timestamp: new Date().toISOString()
    });
  } finally {
    console.log('[API] === FIN /api/profile/pro/typepiece ===');
  }
}