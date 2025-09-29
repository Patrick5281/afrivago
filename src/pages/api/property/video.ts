import type { NextApiRequest, NextApiResponse } from 'next';
import { getPropertyVideo, insertPropertyVideo, deletePropertyVideo } from '@/api/property';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface VideoUploadError {
  error: string;
  details?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { propertyId } = req.query;
      
      if (!propertyId || typeof propertyId !== 'string') {
        return res.status(400).json({ error: 'propertyId requis' });
      }

      try {
      const video = await getPropertyVideo(propertyId);
      return res.status(200).json(video);
      } catch (error) {
        console.error('Erreur lors de la récupération de la vidéo:', error);
        return res.status(500).json({ 
          error: 'Erreur lors de la récupération de la vidéo',
          details: (error as Error).message 
        });
      }
    }

    if (req.method === 'POST') {
      const formidableModule = await import('formidable');
      const IncomingForm = formidableModule.default?.IncomingForm || formidableModule.IncomingForm || formidableModule.default;
      const form = new IncomingForm();
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Erreur lors du parsing du formulaire:', err);
          return res.status(500).json({ 
            error: 'Erreur lors du traitement du fichier',
            details: err.message 
          });
        }

        let propertyId = fields.propertyId;
        if (Array.isArray(propertyId)) {
          propertyId = propertyId[0];
        }
        let file = files.file as any;
        if (Array.isArray(file)) {
          file = file[0];
        }

        if (!propertyId || !file) {
          return res.status(400).json({ 
            error: 'propertyId et fichier requis' 
          });
        }

        try {
          // Vérifier si une vidéo existe déjà pour cette propriété
          const existingVideo = await getPropertyVideo(propertyId);
          if (existingVideo) {
            // Supprimer l'ancienne vidéo avant d'ajouter la nouvelle
            await deletePropertyVideo(existingVideo.id);
          }

          const video = await insertPropertyVideo(propertyId, file);
          return res.status(200).json(video);
        } catch (error) {
          console.error('Erreur lors de l\'upload de la vidéo:', error);
          return res.status(500).json({ 
            error: 'Erreur lors de l\'upload de la vidéo', 
            details: (error as Error).message 
          });
    }
      });
      return;
    }

    if (req.method === 'DELETE') {
      const { videoId } = req.body;
      
      if (!videoId) {
        return res.status(400).json({ error: 'videoId requis' });
      }

      try {
      await deletePropertyVideo(videoId);
      return res.status(200).json({ success: true });
      } catch (error) {
        console.error('Erreur lors de la suppression de la vidéo:', error);
        return res.status(500).json({ 
          error: 'Erreur lors de la suppression de la vidéo', 
          details: (error as Error).message 
        });
      }
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });
    
  } catch (error) {
    console.error('Erreur générale dans l\'API video:', error);
    return res.status(500).json({ 
      error: 'Erreur interne du serveur',
      details: (error as Error).message 
    });
  }
} 