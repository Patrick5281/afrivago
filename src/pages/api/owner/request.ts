import type { NextApiRequest, NextApiResponse } from 'next';
import { submitOwnerRequest } from '@/api/owner';
import { getUserProperties } from '@/api/owner';
const formidable = require('formidable');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err: any, fields: any, files: any) => {
      if (err) return res.status(400).json({ error: 'Erreur lors du parsing du formulaire' });
      const getField = (f: any) => Array.isArray(f) ? f[0] : f;
      console.log("Fields reçus :", fields);
      console.log("user_id brut :", fields.user_id, "user_id après getField :", getField(fields.user_id));
      try {
        const result = await submitOwnerRequest({
          user_id: getField(fields.user_id),
          nom_complet: getField(fields.nom_complet),
          telephone: getField(fields.telephone),
          adresse: getField(fields.adresse),
          type_piece_id: getField(fields.type_piece_id),
          numero_piece: getField(fields.numero_piece),
          message: getField(fields.message),
          pieceFile: files.pieceFile,
          titreFoncierFile: files.titreFoncierFile,
        });
        console.log('Demande créée pour user_id:', getField(fields.user_id));
        return res.status(201).json(result);
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }
    });
  } else if (req.method === 'GET') {
    const userId = req.headers['user-id'] as string;
    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    try {
      const properties = await getUserProperties(userId);
      return res.status(200).json(properties);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Erreur serveur' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
  }
} 