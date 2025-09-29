import { useEffect, useState } from 'react';
import { MesBiensView } from './MesBiens.view';
import { useAuth } from '@/Context/AuthUserContext';

export const MesBiensContainer = () => {
  const { authUser, authUserIsLoading } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[MesBiens] useEffect déclenché', { authUser, authUserIsLoading });
    if (authUserIsLoading) return;
    if (!authUser) {
      setProperties([]);
      setLoading(false);
      setError('Utilisateur non connecté');
      console.warn('[MesBiens] Utilisateur non connecté');
      return;
    }
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      console.log('[MesBiens] Appel API /api/owner/request avec user-id', authUser.id);
      try {
        const response = await fetch('/api/owner/request', {
          headers: {
            'user-id': authUser.id,
          },
        });
        console.log('[MesBiens] Réponse API status', response.status);
        if (!response.ok) {
          const text = await response.text();
          console.error('[MesBiens] Erreur API', response.status, text);
          throw new Error('Erreur lors du chargement des propriétés');
        }
        const data = await response.json();
        console.log('[MesBiens] Données reçues', data);
        setProperties(data);
      } catch (error: any) {
        console.error('[MesBiens] Exception attrapée', error);
        setError(error.message || 'Erreur inconnue');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [authUser, authUserIsLoading]);

  // Catégorisation
  const recentProperties = [...properties]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  // Populaires : ici on prend les 6 biens les plus chers (à adapter si on a un vrai critère de popularité)
  const popularProperties = [...properties]
    .filter(p => p.price)
    .sort((a, b) => (b.price || 0) - (a.price || 0))
    .slice(0, 6);

  // Masqués : statut 'hidden' ou similaire (à adapter selon la donnée réelle)
  const hiddenProperties = properties.filter(p => p.statut === 'hidden' || p.hidden === true);

  return (
      <MesBiensView
      recentProperties={recentProperties}
      popularProperties={popularProperties}
      hiddenProperties={hiddenProperties}
        loading={loading}
        error={error}
    />
  );
};
