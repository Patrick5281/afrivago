import { PropertyDetails } from '@/api/property';
import { Button } from '../button/button';
import { Edit, Trash2, MapPin, Home, Calendar, Euro } from 'lucide-react';
import Image from 'next/image';
import { Typography } from '../typography/typography';
import clsx from 'clsx';

interface PropertyCardProps {
  property: PropertyDetails;
  onEdit: (propertyId: string) => void;
  onDelete: (propertyId: string) => void;
  isLoading?: boolean;
}

export const PropertyCard = ({ property, onEdit, onDelete, isLoading }: PropertyCardProps) => {
  const mainImage = property.property_images[0]?.url || '/images/placeholder-property.jpg';
  const price = property.property_pricing?.amount || 0;
  const currency = property.property_pricing?.currency || 'CFA';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image principale */}
      <div className="relative h-48 w-full">
        <Image
          src={mainImage}
          alt={property.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            variant="ico"
            icon={{ icon: Edit }}
            iconTheme="secondary"
            action={() => onEdit(property.id)}
            disabled={isLoading}
          />
          <Button
            variant="ico"
            icon={{ icon: Trash2 }}
            iconTheme="danger"
            action={() => onDelete(property.id)}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4 space-y-3">
        <Typography variant="h3" component="h3" className="line-clamp-1">
          {property.title}
        </Typography>

        <div className="flex items-center gap-2 text-gray-600">
          <MapPin size={16} />
          <Typography variant="caption3">
            {property.city}, {property.countries.name}
          </Typography>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Home size={16} />
          <Typography variant="caption3">
            {property.property_types.name}
          </Typography>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={16} />
          <Typography variant="caption3">
            Construit en {property.year_built}
          </Typography>
        </div>

        <div className="flex items-center gap-2 text-primary font-semibold">
          <Euro size={16} />
          <Typography variant="caption2">
            {price.toLocaleString()} {currency}
          </Typography>
        </div>

        {/* Badge de statut */}
        <div className={clsx(
          "inline-block px-2 py-1 rounded-full text-xs font-medium",
          property.status === 'published' ? "bg-green-100 text-green-800" :
          property.status === 'draft' ? "bg-yellow-100 text-yellow-800" :
          "bg-gray-100 text-gray-800"
        )}>
          {property.status === 'published' ? 'Publié' :
           property.status === 'draft' ? 'Brouillon' :
           'Archivé'}
        </div>
      </div>
    </div>
  );
}; 