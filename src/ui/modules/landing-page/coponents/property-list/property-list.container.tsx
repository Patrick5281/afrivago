import { useEffect, useState } from 'react';
import PropertyListView from './property-list.view';
import { PublicProperty } from '@/api/public-properties';
import { useAuth } from '@/Context/AuthUserContext';
import { useRoleContext } from '@/Context/RoleContext';

const FILTERS = [
  { label: 'Voir tout', value: 'all' },
  { label: 'Villa', value: 'villa' },
  { label: 'Maison', value: 'maison' },
  { label: 'Studio', value: 'studio' },
  { label: 'Appartement', value: 'appartement' },
];

// Ajout de la prop searchValue (optionnelle)
interface PropertyListContainerProps {
  searchValue?: string;
  properties?: PublicProperty[]; // Optionnel, pour mode contrôlé
}

export const PropertyListContainer = ({ searchValue = '', properties: propsProperties }: PropertyListContainerProps) => {
  const { authUser, abortController, authUserIsLoading } = useAuth();
  const { activeRole } = useRoleContext(); // Ajouté
  const [properties, setProperties] = useState<PublicProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [recommendedProperties, setRecommendedProperties] = useState<PublicProperty[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    if (authUserIsLoading) return; // N'essaie pas de fetch tant que l'auth charge
    // Si on fournit properties en props, on ne fetch pas
    if (propsProperties) {
      setProperties(propsProperties);
      setLoading(false);
      return;
    }
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/property/public-properties', {
          signal: abortController?.signal
        });
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des propriétés');
        }
        const data = await response.json();
        setProperties(data);
      } catch (error: any) {
        // Ignorer les erreurs d'annulation
        if (error.name !== 'AbortError') {
        console.error('Erreur:', error);
        }
        // On pourrait ajouter un état pour gérer l'erreur si nécessaire
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [propsProperties, abortController, authUserIsLoading]);

  useEffect(() => {
    if (authUserIsLoading || !authUser) return; // N'essaie pas de fetch tant que l'auth charge ou que l'utilisateur n'est pas prêt
    const fetchRecommendations = async () => {
      if (
        activeRole?.nom?.toLowerCase() === 'locataire' &&
        authUser.id
      ) {
        setLoadingRecommendations(true);
        try {
          const res = await fetch(`/api/recommendations?userId=${authUser.id}`, {
            signal: abortController?.signal
          });
          if (res.ok) {
            const data = await res.json();
            setRecommendedProperties(data);
          } else {
            setRecommendedProperties([]);
          }
        } catch (e) {
          // Ignorer les erreurs d'annulation
          if (e instanceof Error && e.name !== 'AbortError') {
            console.error('Erreur lors du chargement des recommandations:', e);
          }
          setRecommendedProperties([]);
        } finally {
          setLoadingRecommendations(false);
        }
      } else {
        setRecommendedProperties([]);
      }
    };
    fetchRecommendations();
  }, [authUser, activeRole, abortController, authUserIsLoading]);

  // Filtrage local selon le type puis la ville (searchValue)
  const filteredProperties = properties
    .filter((p) => filter === 'all' || (p.property_types?.name?.toLowerCase() || '').includes(filter))
    .filter((p) => !searchValue || (p.city?.toLowerCase() || '').includes(searchValue.toLowerCase()));

  // LOGS DEBUG
  console.log('[DEBUG] authUser:', authUser);
  console.log('[DEBUG] recommendedProperties:', recommendedProperties);
  console.log('[DEBUG] properties:', properties);

  if (loading) {
    return <div className="w-full text-center py-8">Chargement des propriétés...</div>;
  }

  return (
    <PropertyListView
      properties={filteredProperties}
      loading={loading}
      filters={FILTERS}
      activeFilter={filter}
      onFilterChange={setFilter}
      recommendedProperties={recommendedProperties}
      loadingRecommendations={loadingRecommendations}
    />
  );
};

export default PropertyListContainer;

