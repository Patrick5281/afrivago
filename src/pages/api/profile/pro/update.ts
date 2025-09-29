import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '../auth/[...nextauth]';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[API] PATCH /api/profile/pro/update - Début requête');
  if (req.method !== 'PATCH') {
    console.log('[API] Méthode non autorisée:', req.method);
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const form = new IncomingForm({
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10 Mo max
    multiples: false,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('[API] Erreur parsing formidable:', err);
      return res.status(500).json({ error: 'Erreur lors du parsing du formulaire' });
    }
    const getString = (val: any) => Array.isArray(val) ? val[0] : val || '';
    const userId = getString(fields.id);
    const name = getString(fields.name);
    const surname = getString(fields.surname);
    const type_piece_id = getString(fields.type_piece_id);
    const numero_piece = getString(fields.numero_piece);
    
    console.log('[API] Données reçues:', { userId, name, surname, type_piece_id, numero_piece });
    
    if (!userId) {
      return res.status(400).json({ error: 'id utilisateur manquant' });
    }
    
    if (!name || !surname) {
      console.warn('[API] Champs nom/prénom manquants', { name, surname });
      return res.status(400).json({ error: 'Nom et prénom obligatoires' });
    }
    // Crée le dossier documents/{userId}/
    const userDir = path.join(process.cwd(), 'public', 'uploads', 'documents', userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
      console.log('[API] Dossier upload créé:', userDir);
    }
    // Déplace les fichiers uploadés dans le bon dossier si besoin
    let fichier_piece_url = null;
    let titre_foncier_url = null;
    if (files.fichier_piece) {
      const file = Array.isArray(files.fichier_piece) ? files.fichier_piece[0] : files.fichier_piece;
      const destPath = path.join(userDir, path.basename(file.filepath));
      if (file.filepath !== destPath) {
        fs.renameSync(file.filepath, destPath);
      }
      fichier_piece_url = `/uploads/documents/${userId}/` + path.basename(destPath);
      console.log('[API] Fichier pièce:', fichier_piece_url);
    }
    if (files.titre_foncier) {
      const file = Array.isArray(files.titre_foncier) ? files.titre_foncier[0] : files.titre_foncier;
      const destPath = path.join(userDir, path.basename(file.filepath));
      if (file.filepath !== destPath) {
        fs.renameSync(file.filepath, destPath);
      }
      titre_foncier_url = `/uploads/documents/${userId}/` + path.basename(destPath);
      console.log('[API] Titre foncier:', titre_foncier_url);
    }
    if (!type_piece_id || !numero_piece) {
      console.warn('[API] Champs obligatoires manquants', { userId, type_piece_id, numero_piece });
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    try {
      console.log('[API] Début des mises à jour...');
      
      // 1. Mise à jour de la table users
      console.log('[API] Mise à jour de la table users...');
      await db.query(
        'UPDATE users SET name = $2, surname = $3 WHERE id = $1',
        [userId, name, surname]
      );
      
      // 2. Vérifier si l'utilisateur a déjà des pièces justificatives
      console.log('[API] Vérification des pièces justificatives...');
      const existingRecord = await db.query(
        'SELECT * FROM piecesjustificatifs WHERE user_id = $1',
        [userId]
      );

      let result;
      
      if (existingRecord.rows.length > 0) {
        // UPDATE si l'enregistrement existe
        console.log('[API] Mise à jour de l\'enregistrement existant...');
        
        // Garder les URLs existantes si aucun nouveau fichier n'est uploadé
        const existingData = existingRecord.rows[0];
        const finalFichierPiece = fichier_piece_url || existingData.fichier_piece;
        const finalTitreFoncier = titre_foncier_url || existingData.titre_foncier;
        
        result = await db.query(
          `UPDATE piecesjustificatifs 
           SET type_piece_id = $2, 
               numero_piece = $3, 
               fichier_piece = $4, 
               titre_foncier = $5
           WHERE user_id = $1
           RETURNING *;`,
          [userId, type_piece_id, numero_piece, finalFichierPiece, finalTitreFoncier]
        );
      } else {
        // INSERT si l'enregistrement n'existe pas
        console.log('[API] Création d\'un nouvel enregistrement...');
        result = await db.query(
          `INSERT INTO piecesjustificatifs (user_id, type_piece_id, numero_piece, fichier_piece, titre_foncier)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *;`,
          [userId, type_piece_id, numero_piece, fichier_piece_url, titre_foncier_url]
        );
      }
      
      // 3. Récupérer les données mises à jour
      const updatedUser = await db.query(`
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
      `, [userId]);
      
      console.log('[API] Succès - données mises à jour:', updatedUser.rows[0]);
      return res.status(200).json(updatedUser.rows[0]);
    } catch (error) {
      console.error('[API] Erreur SQL:', error);
      return res.status(500).json({ error: 'Erreur serveur', details: error });
    }
  });
} 