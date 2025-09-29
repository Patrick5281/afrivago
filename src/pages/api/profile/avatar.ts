import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { profileService } from '@/api/profile';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ error: 'userId requis' });
  }

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles', 'avatar', userId);
    fs.mkdirSync(uploadDir, { recursive: true });

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024,
    });

    const [fields, files] = await form.parse(req);

    const file = files.file?.[0] as formidable.File | undefined;

    if (!file) {
      return res.status(400).json({ error: 'Aucun fichier reçu' });
    }

    // Renomme le fichier en avatar.jpg, en supprimant l'ancien s'il existe
    const newPath = path.join(uploadDir, 'avatar.jpg');
    if (fs.existsSync(newPath)) {
        fs.unlinkSync(newPath);
    }
    fs.renameSync(file.filepath, newPath);

    // Chemin relatif pour l'URL, commençant par /
    const relativePath = `/uploads/profiles/avatar/${userId}/avatar.jpg`;

    // Met à jour la colonne photourl en base de données
    await profileService.updateAvatar(userId, relativePath);

    return res.status(200).json({ photourl: relativePath });

  } catch (error) {
    console.error("Erreur lors de l'upload de l'avatar:", error);
    return res.status(500).json({ error: "Erreur serveur lors de l'upload" });
  }
} 