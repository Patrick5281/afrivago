import type { NextApiRequest, NextApiResponse } from 'next';
import { PreferencesService } from '@/api/preferences';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const preferences = await PreferencesService.getAllPreferences();
    
    const response = {
      success: true,
      data: preferences,
      total: Object.values(preferences).reduce((acc: number, category: any) => acc + category.length, 0)
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Erreur lors de la récupération des préférences:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des préférences',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 