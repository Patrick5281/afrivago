// pages/api/property/images.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';
import { propertyService } from '@/api/property';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ajout pour parser le body JSON sur DELETE si bodyParser est désactivé
  if (req.method === 'DELETE') {
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const data = Buffer.concat(buffers).toString();
    req.body = data ? JSON.parse(data) : {};
  }
  
  // GET - Récupérer les images d'une propriété
  if (req.method === 'GET') {
    try {
      const { propertyId } = req.query;
      
      if (!propertyId || typeof propertyId !== 'string') {
        return res.status(400).json({ error: 'propertyId requis' });
      }

      console.log('[DEBUG] Récupération des images pour propertyId:', propertyId);
      const images = await propertyService.getPropertyImages(propertyId);
      return res.status(200).json(images);

    } catch (error) {
      console.error('[ERROR] Erreur GET images:', error);
      return res.status(500).json({ 
        error: 'Erreur lors de la récupération des images',
        details: (error as Error).message 
      });
    }
  }

  // POST - Uploader une nouvelle image
  if (req.method === 'POST') {
    try {
      const form = formidable({
        maxFileSize: 10 * 1024 * 1024, // 10MB max
        maxFiles: 1,
        allowEmptyFiles: false,
        filter: ({ mimetype }) => {
          return !!(mimetype && mimetype.includes('image'));
        },
      });

      const [fields, files] = await form.parse(req);
      
      const propertyId = Array.isArray(fields.propertyId) ? fields.propertyId[0] : fields.propertyId;
      const file = Array.isArray(files.file) ? files.file[0] : files.file;

      if (!propertyId || !file) {
        return res.status(400).json({ error: 'propertyId et fichier requis' });
      }

      console.log('[DEBUG] Upload image pour propertyId:', propertyId);
      console.log('[DEBUG] Fichier reçu:', file.originalFilename, file.size, file.mimetype);

      // Toute la logique de copie et d'enregistrement est déléguée au service
      const imageRecord = await propertyService.addPropertyImage(propertyId, file);

      console.log('[DEBUG] Image ajoutée avec succès:', imageRecord);
      return res.status(200).json(imageRecord);

    } catch (error) {
      console.error('[ERROR] Erreur POST image:', error);
      return res.status(500).json({ 
        error: 'Erreur lors de l\'upload de l\'image',
        details: (error as Error).message 
      });
    }
  }

  // DELETE - Supprimer une image
  if (req.method === 'DELETE') {
    try {
      const { imageId } = req.body;
      
      if (!imageId) {
        return res.status(400).json({ error: 'imageId requis' });
      }

      console.log('[DEBUG] Suppression de l\'image:', imageId);
      await propertyService.deletePropertyImage(imageId);
      
      return res.status(200).json({ success: true });

    } catch (error) {
      console.error('[ERROR] Erreur DELETE image:', error);
      return res.status(500).json({ 
        error: 'Erreur lors de la suppression de l\'image',
        details: (error as Error).message 
      });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
}