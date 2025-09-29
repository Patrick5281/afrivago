import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { DetailsPropertyView } from './detailsproperty.view';
import { ScreenSpinner } from '@/ui/design-system/spinner/screen-spinner';

interface Room {
  id: string;
  name: string;
  room_type_id: string;
  surface: number;
  description?: string;
  photos: string[];
  room_equipments?: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

interface NonHabitableRoom {
  id: string;
  room_type: {
    id: string;
    name: string;
  };
  surface: number;
  quantity: number;
}

interface RentalUnit {
  id: string;
  name: string;
  description: string;
  price: number;
  rooms: Array<{
    id: string;
    name: string;
    room_type_id: string;
    surface: number;
    description?: string;
    room_equipments: any[];
    room_photos: Array<{ url: string }>;
  }>;
}

interface PropertyDetails {
  id: string;
  title: string;
  description: string;
  property_type: {
    id: string;
    name: string;
  };
  status: string;
  city: string;
  country: string;
  address: string;
  property_images: Array<{ url: string }>;
  property_pricing: {
    amount: number;
    currency: string;
  };
  property_terms: {
    animals_allowed: boolean;
    parties_allowed: boolean;
    smoking_allowed: boolean;
    subletting_allowed: boolean;
  };
  rooms: Room[];
  nonHabitableRooms: NonHabitableRoom[];
  video?: {
    url: string;
  };
  rentalUnits: RentalUnit[];
}

export const DetailsPropertyContainer = () => {
  const router = useRouter();
  const { id } = router.query;
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchPropertyDetails = async () => {
      try {
        const res = await fetch(`/api/property/details?id=${id}`);
        if (!res.ok) throw new Error('Erreur lors de la récupération de la propriété');
        const data = await res.json();
        setPropertyDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyDetails();
  }, [id]);

  if (loading) {
    return <ScreenSpinner />;
  }

  if (error || !propertyDetails) {
    return <div>Erreur: {error || 'Propriété non trouvée'}</div>;
  }

  return (
    <DetailsPropertyView 
      property={propertyDetails}
      rooms={propertyDetails.rooms}
      nonHabitableRooms={propertyDetails.nonHabitableRooms}
      propertyVideo={propertyDetails.video}
      rentalUnits={propertyDetails.rentalUnits}
    />
  );
}; 