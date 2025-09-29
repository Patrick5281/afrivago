import { NextApiRequest, NextApiResponse } from 'next';
import { 
  getUserProperties, 
  updateProperty, 
  deleteProperty, 
  updatePropertyStatus,
  verifyPropertyOwnership
} from '@/api/user-properties';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query, body } = req;

  // Récupérer l'ID de l'utilisateur depuis la session
  // Note: À adapter selon votre système d'authentification
  const userId = req.headers['user-id'] as string;
  if (!userId) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    switch (method) {
      case 'GET':
        // Récupérer toutes les propriétés de l'utilisateur
        const properties = await getUserProperties(userId);
        return res.status(200).json(properties);

      case 'PATCH':
        const propertyId = query.propertyId as string;
        if (!propertyId) {
          return res.status(400).json({ message: 'ID de la propriété requis' });
        }

        // Vérifier que l'utilisateur est propriétaire
        const isOwner = await verifyPropertyOwnership(propertyId, userId);
        if (!isOwner) {
          return res.status(403).json({ message: 'Accès non autorisé à cette propriété' });
        }

        if (body.status) {
          // Mise à jour du statut
          const updatedProperty = await updatePropertyStatus(propertyId, body.status);
          return res.status(200).json(updatedProperty);
        } else {
          // Mise à jour générale
          const updatedProperty = await updateProperty(propertyId, body);
          return res.status(200).json(updatedProperty);
        }

      case 'DELETE':
        const deleteId = query.propertyId as string;
        if (!deleteId) {
          return res.status(400).json({ message: 'ID de la propriété requis' });
        }

        // Vérifier que l'utilisateur est propriétaire
        const canDelete = await verifyPropertyOwnership(deleteId, userId);
        if (!canDelete) {
          return res.status(403).json({ message: 'Accès non autorisé à cette propriété' });
        }

        await deleteProperty(deleteId);
        return res.status(200).json({ message: 'Propriété supprimée avec succès' });

      default:
        res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
        return res.status(405).json({ message: `Méthode ${method} non autorisée` });
    }
  } catch (error: any) {
    console.error('[ERROR] Erreur dans user-properties:', error);
    return res.status(500).json({ 
      message: error.message || 'Erreur lors du traitement de la requête' 
    });
  }
} 