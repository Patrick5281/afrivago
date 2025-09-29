import type { NextApiRequest, NextApiResponse } from 'next';
import { createReservation, getUserReservations } from '@/api/details-property';
import { sendNotification } from '@/utils/notifications';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST':
        await handleCreateReservation(req, res);
        break;
      case 'GET':
        await handleGetReservations(req, res);
        break;
      default:
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleCreateReservation(req: NextApiRequest, res: NextApiResponse) {
  const { propertyId, rentalUnitId, startDate, endDate, guests } = req.body;

  // Validation des données requises
  if (!startDate || !endDate) {
    return res.status(400).json({ 
      error: 'Les dates de début et de fin sont requises' 
    });
  }

  if (!propertyId && !rentalUnitId) {
    return res.status(400).json({ 
      error: 'Un propertyId ou rentalUnitId est requis' 
    });
  }

  // Validation des dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (start >= end) {
    return res.status(400).json({ 
      error: 'La date de fin doit être après la date de début' 
    });
  }

  if (start < now) {
    return res.status(400).json({ 
      error: 'La date de début ne peut pas être dans le passé' 
    });
  }

  try {
    // Récupérer l'ID utilisateur depuis le token/session
    const userId = req.headers['user-id'] as string || 'user-placeholder-id';

    const reservation = await createReservation({
      userId,
      propertyId: propertyId || null,
      rentalUnitId: rentalUnitId || null,
      startDate,
      endDate,
      guests: guests || null
    });

    // Notification de succès au locataire
    await sendNotification(
      userId,
      'reservation',
      'Félicitations, réservation enregistrée !',
      `Votre réservation a bien été prise en compte. Pour la valider définitivement, effectuez le paiement de la caution ou du loyer.`,
      { reservationId: reservation.id, propertyId, rentalUnitId, startDate, endDate },
      res.socket?.server?.io
    );

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      reservation
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création de la réservation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleGetReservations(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Récupérer l'ID utilisateur depuis le token/session
    const userId = req.headers['user-id'] as string || req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ 
        error: 'ID utilisateur requis' 
      });
    }

    const reservations = await getUserReservations(userId);

    res.status(200).json({
      success: true,
      reservations
    });
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des réservations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}