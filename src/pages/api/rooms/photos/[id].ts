import type { NextApiRequest, NextApiResponse } from 'next';
import { deleteRoomPhoto } from '@/api/rooms';
import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function savePhotoToDB(room_id: string, url: string) {
  const pool = db.getPool();
  await pool.query(
    'INSERT INTO room_photos (id, room_id, url) VALUES ($1, $2, $3)',
    [uuidv4(), room_id, url]
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id: room_id, unit_id } = req.query;

  if (!room_id || typeof room_id !== 'string') return res.status(400).json({ error: 'room_id requis' });

  if (req.method === 'POST') {
    // UPLOAD
    const form = formidable({ keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('[UPLOAD][photo] Erreur formidable:', err);
        return res.status(500).json({ error: 'Erreur upload' });
      }

      const file = files.file;
      if (!file) {
        console.error('[UPLOAD][photo] Aucun fichier reçu');
        return res.status(400).json({ error: 'Aucun fichier envoyé' });
      }

      const fileArray = Array.isArray(file) ? file : [file];
      const urls: string[] = [];

      for (const f of fileArray) {
        const ext = path.extname(f.originalFilename || f.newFilename || '');
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        const destDir = unit_id
          ? path.join(process.cwd(), 'public', 'rooms', unit_id as string, room_id)
          : path.join(process.cwd(), 'public', 'rooms', room_id);
        await fs.mkdir(destDir, { recursive: true });
        const destPath = path.join(destDir, fileName);

        console.log('[UPLOAD][photo] Fichier reçu:', {
          original: f.originalFilename,
          temp: f.filepath,
          dest: destPath,
          url: unit_id
            ? `/rooms/${unit_id}/${room_id}/${fileName}`
            : `/rooms/${room_id}/${fileName}`,
        });

        await fs.rename(f.filepath, destPath);

        const url = unit_id
          ? `/rooms/${unit_id}/${room_id}/${fileName}`
          : `/rooms/${room_id}/${fileName}`;

        await savePhotoToDB(room_id, url);
        urls.push(url);
      }

      console.log('[UPLOAD][photo] Upload terminé, urls:', urls);

      return res.status(200).json({ urls });
    });
    return;
  }

  if (req.method === 'GET') {
    // Non implémenté ici, images servies via /public
    return res.status(405).json({ error: 'GET non implémenté ici, servez les images via /public' });
  }

  if (req.method === 'DELETE') {
    try {
      await deleteRoomPhoto(room_id as string);
      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
  return res.status(405).json({ error: 'Méthode non autorisée' });
} 