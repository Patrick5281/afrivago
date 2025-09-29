import React from 'react';
import PropertyListView from '@/ui/modules/landing-page/coponents/property-list/property-list.view';
import Lottie from "lottie-react";
import noDataAnimation from "public/assets/animation/No-Data.json";
import { Typography } from '@/ui/design-system/typography/typography';

// Mock temporaire pour la démo
const mockFavoris = [
  {
    id: '1',
    title: 'Villa Prestige Cocotiers',
    countries: 'Bénin',
    city: 'Cotonou',
    surface: 200,
    statut: 'published',
    property_type_id: 'villa',
    description: "Nichée dans l'un des quartiers les plus prisés de Cotonou, la Villa Prestige Cocotiers est un véritable havre de paix...",
    property_types: { name: 'Villa' },
    property_images: [{ url: 'https://via.placeholder.com/400x300?text=Photo' }],
    created_at: '2024-05-01',
    pricing: { amount: 650000, currency: 'FCFA' },
    caracteristiques: { chambre: 3, salon: 1, bureau: 1 },
  },
  // Ajoute d'autres mocks si besoin
];

interface FavorisViewProps {
  properties: any[];
  loading: boolean;
}

const FavorisView: React.FC<FavorisViewProps> = ({ properties, loading }) => {
  // Adapter les propriétés pour PropertyListView
  const adaptedProperties = properties.map((p: any) => ({
    ...p,
    property_images: p.image_url ? [{ url: p.image_url }] : [],
    pricing: p.price ? { amount: Number(p.price), currency: p.currency } : undefined,
    property_types: p.property_type ? { name: p.property_type } : undefined,
  }));

  if (!loading && adaptedProperties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="flex justify-center mb-4">
          <Lottie
            animationData={noDataAnimation}
            loop
            style={{ width: 220, height: 220 }}
          />
        </div>
        <div className="text-center">
          <Typography variant='lead'>Aucun favori pour le moment.</Typography>
        </div>
      </div>
    );
  }

  return (
    <PropertyListView
      properties={adaptedProperties}
      loading={loading}
      filters={[]}
      activeFilter=""
      onFilterChange={() => {}}
    />
  );
};

export default FavorisView;
