import { query } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { NextApiRequest } from 'next';

export interface UserProfile {
  id: string;
  name: string;
  surname: string;
  photo_url?: string;
  onboardingiscompleted?: boolean;
}

export const profileService = {
  // Mettre à jour les infos utilisateur
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const key in updates) {
      fields.push(`${key} = $${idx}`);
      values.push((updates as any)[key]);
      idx++;
    }
    values.push(userId);
    const { rows } = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0];
  },

  // Mettre à jour l'avatar
  async updateAvatar(userId: string, photo_url: string): Promise<UserProfile> {
    const { rows } = await query(
      'UPDATE users SET photourl = $1 WHERE id = $2 RETURNING *',
      [photo_url, userId]
    );
    return rows[0];
  },

  // Enregistrer un fichier d'avatar et retourner le chemin relatif
  async saveAvatarFile(req: NextApiRequest, userId: string): Promise<string> {
    // On suppose que le fichier est envoyé en multipart/form-data sous le champ 'file'
    // Utilise formidable ou un équivalent pour parser le fichier
    // Ici, on ne code que la signature, l'implémentation dépendra du handler API
    // Retourne le chemin relatif à stocker dans la BDD, ex: uploads/profiles/{userId}/avatar.jpg
    throw new Error('Not implemented: utilise formidable ou multer dans l API route');
  },

  // Mettre à jour onboardingiscompleted
  async setOnboardingCompleted(userId: string): Promise<UserProfile> {
    const { rows } = await query(
      'UPDATE users SET onboardingiscompleted = true WHERE id = $1 RETURNING *',
      [userId]
    );
    return rows[0];
  },
};
