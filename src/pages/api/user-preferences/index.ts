import type { NextApiRequest, NextApiResponse } from 'next';
import { PreferencesService } from '@/api/preferences';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    case 'PUT':
      return handlePut(req, res);
    case 'DELETE':
      return handleDelete(req, res);
    default:
      return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}

// Récupérer les préférences d'un utilisateur
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = req.query;
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'ID utilisateur requis' });
    }

    const userPreferences = await PreferencesService.getUserPreferences(userId);
    
    return res.status(200).json({
      success: true,
      data: userPreferences
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des préférences utilisateur:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des préférences',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}

// Sauvegarder les préférences d'un utilisateur
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId, preferenceIds } = req.body;
    
    if (!userId || !preferenceIds || !Array.isArray(preferenceIds)) {
      return res.status(400).json({ 
        error: 'ID utilisateur et liste des préférences requis' 
      });
    }

    await PreferencesService.saveUserPreferences(userId, preferenceIds);
    
    return res.status(201).json({
      success: true,
      message: 'Préférences sauvegardées avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la sauvegarde des préférences:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur lors de la sauvegarde des préférences',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}

// Mettre à jour les préférences d'un utilisateur
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId, preferenceIds } = req.body;
    
    if (!userId || !preferenceIds || !Array.isArray(preferenceIds)) {
      return res.status(400).json({ 
        error: 'ID utilisateur et liste des préférences requis' 
      });
    }

    await PreferencesService.updateUserPreferences(userId, preferenceIds);
    
    return res.status(200).json({
      success: true,
      message: 'Préférences mises à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des préférences:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur lors de la mise à jour des préférences',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}

// Supprimer les préférences d'un utilisateur
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = req.query;
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'ID utilisateur requis' });
    }

    await PreferencesService.deleteUserPreferences(userId);
    
    return res.status(200).json({
      success: true,
      message: 'Préférences supprimées avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression des préférences:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur lors de la suppression des préférences',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 