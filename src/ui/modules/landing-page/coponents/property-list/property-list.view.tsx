import { Button } from '@/ui/design-system/button/button';
import { ScreenSpinner } from '@/ui/design-system/spinner/screen-spinner';
import { Typography } from '@/ui/design-system/typography/typography';
import { MapPin } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { FaBed, FaCouch, FaBriefcase, FaHeart, FaEye, FaRegBookmark } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useFavorites } from '@/hooks/use-favorites';

interface Caracteristiques {
  chambre: number;
  salon: number;
  bureau: number;
}

interface Property {
  id: string;
  title: string;
  countries: string;
  city: string;
  surface: number;
  statut: string;
  property_type_id: string;
  description: string;
  property_types?: { name: string };
  property_images?: { url: string }[];
  created_at?: string;
  pricing?: { amount: number; currency: string };
  caracteristiques: Caracteristiques;
  price_amount?: number;
  property_type_name?: string;
}

interface PropertyListViewProps {
  properties: Property[];
  loading: boolean;
  filters: { label: string; value: string }[];
  activeFilter: string;
  onFilterChange: (value: string) => void;
}

const badgeColor = {
  FEATURED: 'bg-primary text-white',
  'FOR SALE': 'bg-green-100 text-green-700',
};

const typeColor: Record<string, string> = {
  studio: 'bg-secondary text-black ',
  villa: 'bg-primary text-white',
  appartement: 'bg- text-blue-700',
  maison: 'bg-yellow text-black',
};

const caracteristiqueIcons = [
  { key: 'chambre', icon: <FaBed className="text-gray-600" />, label: 'Chambre' },
  { key: 'salon', icon: <FaCouch className="text-gray-600" />, label: 'Salon' },
  { key: 'bureau', icon: <FaBriefcase className="text-gray-600" />, label: 'Bureau' },
];

const PropertyListView: React.FC<PropertyListViewProps & { recommendedProperties?: Property[] }> = ({ properties, loading, filters, activeFilter, onFilterChange, recommendedProperties }) => {
  const router = useRouter();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const handleToggleFavorite = (propertyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite(propertyId)) {
      removeFavorite(propertyId);
    } else {
      addFavorite(propertyId);
    }
  };

  return (
    <section className="py-10 bg-white">
      {/* SECTION RECOMMANDATIONS */}
      {recommendedProperties && recommendedProperties.length > 0 && (
        <>
          <Typography variant='lead' weight='medium' font='sriracha' className="font-bold text-center mb-4 text-primary">Recommandations pour vous <span role="img" aria-label="star">⭐</span></Typography>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
            {recommendedProperties.map((p: Property, idx: number) => {
              const type = p.property_types?.name?.toLowerCase() || p.property_type_name?.toLowerCase() || '';
              const img = (p.property_images?.[0]?.url) || 'https://via.placeholder.com/400x300?text=Photo';
              const prix = p.price_amount ? `${Number(p.price_amount).toLocaleString()} FCFA` : '--';
              const desc = p.description?.length > 100 ? p.description.slice(0, 100) + '…' : p.description;
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-[20px] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-100 cursor-pointer"
                  onClick={() => router.push(`/property/${p.id}`)}
                >
                  <div className="relative h-48 w-full overflow-hidden group">
                    <Image src={img} alt={p.title} width={380} height={440} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute top-2 left-2 flex gap-2 z-10">
                      <span className="px-2 py-1 text-xs rounded bg-primary-600 text-white font-bold">FEATURED</span>
                      <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 font-bold">FOR SALE</span>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2 z-20">
                      <button
                        className={`bg-white/80 rounded-full p-2 shadow hover:bg-white ${isFavorite(p.id) ? 'text-red-500' : 'text-gray-400'}`}
                        onClick={e => handleToggleFavorite(p.id, e)}
                        aria-label={isFavorite(p.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      >
                        <FaHeart />
                      </button>
                      <button className="bg-white/80 rounded-full p-2 shadow hover:bg-white"><FaEye /></button>
                      <button className="bg-white/80 rounded-full p-2 shadow hover:bg-white"><FaRegBookmark /></button>
                    </div>
                    <span className={`absolute bottom-2 left-2 px-2 py-1 text-xs rounded font-bold capitalize ${typeColor[type] || 'bg-gray-200'}`}>{p.property_types?.name || p.property_type_name || ''}</span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <Typography variant='body-sm' className='font-semibold'>{p.title}</Typography>
                    <div className='flex items-center space-x-48'>
                      <Typography variant='body-base' className=" flex items-center gap-2">
                        <MapPin size={16} className="text-black" />
                        {p.city}
                      </Typography>
                      <div className="flex gap-4 text-gray text-sm mb-2 mt-1">
                        {caracteristiqueIcons.map(({ key, icon, label }) => (
                          p.caracteristiques?.[key as keyof Caracteristiques] > 0 && (
                            <span key={key} className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                              {icon} {p.caracteristiques[key as keyof Caracteristiques]}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                    <Typography className="text-primary font-bold text-lg mb-2">{prix} <span className="text-xs text-gray font-normal">/mois</span></Typography>
                    <Typography variant='body-sm'>{desc}</Typography>
                    {/* Effet vague + prix centré */}
                    <div className="relative mt-2">
                      <svg
                        viewBox="0 0 400 40"
                        className="absolute left-0 w-full h-10 -top-6"
                        style={{ zIndex: 1 }}
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M0,40 Q200,0 400,40 L400,40 L0,40 Z"
                          fill="#fff"
                          stroke="#e5e7eb"
                          strokeWidth="1"
                        />
                      </svg>
                      <div className="relative flex justify-center items-center" style={{ zIndex: 2 }}>
                        <span className="text-green-600 font-bold text-2xl italic" style={{ fontFamily: 'serif' }}>
                          {prix}
                        </span>
                        <span className="text-gray-500 text-base ml-2">/mois</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {/* FIN SECTION RECOMMANDATIONS */}
      <Typography variant='lead' weight='medium' font='sriracha' className=" font-bold text-center mb-4">Quelques logement pour vous <span role="img" aria-label="smile">😍</span></Typography>
      <div className="flex justify-center gap-2 mb-6">
        {filters.map((f: { label: string; value: string }) => (
          <button
            key={f.value}
            className={`px-4 py-2 rounded ${activeFilter === f.value ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'} font-semibold transition`}
            onClick={() => onFilterChange(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>
      {loading ? (
        <ScreenSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {properties.map((p: Property, idx: number) => {
            const type = p.property_types?.name?.toLowerCase() || '';
            const img = p.property_images?.[0]?.url || 'https://via.placeholder.com/400x300?text=Photo';
            const prix = p.pricing?.amount ? `${p.pricing.amount.toLocaleString()} FCFA` : '--';
            const desc = p.description?.length > 100 ? p.description.slice(0, 100) + '…' : p.description;
            return (
              <div
                key={p.id}
                className="bg-white rounded-[20px] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-100 cursor-pointer"
                onClick={() => router.push(`/property/${p.id}`)}
              >
                <div className="relative h-48 w-full overflow-hidden group">
                  <Image src={img} alt={p.title} width={380} height={440} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute top-2 left-2 flex gap-2 z-10">
                    <span className="px-2 py-1 text-xs rounded bg-primary-600 text-white font-bold">FEATURED</span>
                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 font-bold">FOR SALE</span>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-2 z-20">
                    <button
                      className={`bg-white/80 rounded-full p-2 shadow hover:bg-white ${isFavorite(p.id) ? 'text-red-500' : 'text-gray-400'}`}
                      onClick={e => handleToggleFavorite(p.id, e)}
                      aria-label={isFavorite(p.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      <FaHeart />
                    </button>
                    <button className="bg-white/80 rounded-full p-2 shadow hover:bg-white"><FaEye /></button>
                    <button className="bg-white/80 rounded-full p-2 shadow hover:bg-white"><FaRegBookmark /></button>
                  </div>
                  <span className={`absolute bottom-2 left-2 px-2 py-1 text-xs rounded font-bold capitalize ${typeColor[type] || 'bg-gray-200'}`}>{p.property_types?.name || ''}</span>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <Typography variant='body-sm' className='font-semibold'>{p.title}</Typography>
                  <div className='flex items-center space-x-48'>
                         <Typography variant='body-base' className=" flex items-center gap-2">
                      <MapPin size={16} className="text-black" />
                    {p.city}
                  </Typography>
                  <div className="flex gap-4 text-gray text-sm mb-2 mt-1">
                    {caracteristiqueIcons.map(({ key, icon, label }) => (
                      p.caracteristiques?.[key as keyof Caracteristiques] > 0 && (
                        <span key={key} className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                          {icon} {p.caracteristiques[key as keyof Caracteristiques]}
                        </span>
                      )
                    ))}
                  </div>
                  </div>
                 
                  <Typography className="text-primary font-bold text-lg mb-2">{prix} <span className="text-xs text-gray font-normal">/mois</span></Typography>
                  <Typography variant='body-sm'>{desc}</Typography>
                  {/* Effet vague + prix centré */}
                  <div className="relative mt-2">
                    <svg
                      viewBox="0 0 400 40"
                      className="absolute left-0 w-full h-10 -top-6"
                      style={{ zIndex: 1 }}
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0,40 Q200,0 400,40 L400,40 L0,40 Z"
                        fill="#fff"
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                    </svg>
                    <div className="relative flex justify-center items-center" style={{ zIndex: 2 }}>
                      <span className="text-green-600 font-bold text-2xl italic" style={{ fontFamily: 'serif' }}>
                        {prix}
                      </span>
                      <span className="text-gray-500 text-base ml-2">/mois</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default PropertyListView;

