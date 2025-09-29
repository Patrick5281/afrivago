import { useEffect, useState } from 'react';
import { reservationService, ReservationWithDetails } from '@/api/reservations';
import { MesReservationsView } from './mes-reservations.view';
import { ScreenSpinner } from '@/ui/design-system/spinner/screen-spinner';
import { useAuth } from '@/Context/AuthUserContext';

export const MesReservationsContainer = () => {
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authUser } = useAuth();
  const userId = authUser?.id;

  useEffect(() => {
    if (!userId) return;
    const fetchReservations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await reservationService.getUserReservations(userId);
        setReservations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReservations();
  }, [userId]);

  if (isLoading) return <ScreenSpinner />;
  if (error) return <div className="text-center py-16 text-red-600">{error}</div>;

  return <MesReservationsView reservations={reservations} />;
}; 