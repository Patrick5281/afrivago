import { Button } from '@/ui/design-system/button/button';
import { ScreenSpinner } from '@/ui/design-system/spinner/screen-spinner';
import { Typography } from '@/ui/design-system/typography/typography';
import { MapPin, MoreVertical, Plus } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { FaBed, FaCouch, FaBriefcase } from 'react-icons/fa';
import { useRouter } from 'next/router';
import Lottie from "lottie-react";
import noDataAnimation from "public/assets/animation/No-Data.json";

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
  image_url?: string;
  price?: number;
  currency?: string;
  hidden?: boolean;
}

interface MesBiensViewProps {
  recentProperties: Property[];
  popularProperties: Property[];
  hiddenProperties: Property[];
  loading: boolean;
  error?: string | null;
}

const badgeColor = {
  FEATURED: 'bg-primary text-white',
  'FOR SALE': 'bg-green-100 text-green-700',
};

const typeColor: Record<string, string> = {
  studio: 'bg-gray-200',
  villa: 'bg-primary text-white',
  appartement: 'bg-blue-100 text-blue-700',
};

const caracteristiqueIcons = [
  { key: 'chambre', icon: <FaBed className="text-gray-600" />, label: 'Chambre' },
  { key: 'salon', icon: <FaCouch className="text-gray-600" />, label: 'Salon' },
  { key: 'bureau', icon: <FaBriefcase className="text-gray-600" />, label: 'Bureau' },
];

const PropertyCard: React.FC<{ p: Property; idx: number; openMenuIdx: number | null; setOpenMenuIdx: (idx: number | null) => void; }> = ({ p, idx, openMenuIdx, setOpenMenuIdx }) => {
  const img = p.image_url || 'https://via.placeholder.com/400x300?text=Photo';
  const prix = p.price ? `${Number(p.price).toLocaleString()} ${p.currency || ''}` : '--';
  const desc = p.description?.length > 100 ? p.description.slice(0, 100) + '…' : p.description;
  const isMenuOpen = openMenuIdx === idx;
  return (
    <div
      key={p.id}
      className="bg-white rounded-[20px] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-100 cursor-pointer relative"
    >
      <div className="relative h-48 w-full overflow-hidden group">
        <Image src={img} alt={p.title} width={380} height={440} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
            </div>
      <div className="absolute top-3 right-3 z-30">
        <button onClick={e => { e.stopPropagation(); setOpenMenuIdx(isMenuOpen ? null : idx); }} className="p-2 rounded-full hover:bg-gray-100">
          <MoreVertical size={22} />
              </button>
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-40">
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setOpenMenuIdx(null); }}>Prévisualiser</button>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setOpenMenuIdx(null); }}>Éditer</button>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setOpenMenuIdx(null); }}>Masquer/Démasquer</button>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setOpenMenuIdx(null); }}>Dupliquer</button>
            <button className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50" onClick={() => { setOpenMenuIdx(null); }}>Supprimer</button>
                </div>
              )}
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
};

export const MesBiensView: React.FC<MesBiensViewProps> = ({ recentProperties, popularProperties, hiddenProperties, loading, error }) => {
  const [openMenuIdx, setOpenMenuIdx] = React.useState<number | null>(null);
  const router = useRouter();

  return (
    <section className="p-4 min-h-screen">
      {/* Header moderne */}
      <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto px-2">
        <div>
          <Typography variant='lead'>Mes Biens </Typography>
        </div>
        
      </div>
      {error && (
        <div className="text-red-600 text-center font-semibold mb-4">{error}</div>
      )}
      {loading ? (
        <ScreenSpinner />
      ) : (
        <>
          {/* Section Récemment publiés */}
          <div className="mb-10 max-w-6xl mx-auto">
            <Typography variant='body-base' theme='primary'>Récemment publiés</Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {recentProperties.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16">
                  <div className="flex justify-center mb-4">
                    <Lottie
                      animationData={noDataAnimation}
                      loop
                      style={{ width: 220, height: 220 }}
                    />
                  </div>
                  <Typography variant='body-base'>Aucun bien récent.</Typography>
                </div>
              ) : recentProperties.map((p, idx) => (
                <PropertyCard key={p.id} p={p} idx={idx} openMenuIdx={openMenuIdx} setOpenMenuIdx={setOpenMenuIdx} />
              ))}
            </div>
          </div>
          {/* Section Les plus populaires */}
        
          {/* Section Biens masqués */}
          
        </>
      )}
    </section>
  );
};
