import React from "react";
import Image from 'next/image';
import { Typography } from '@/ui/design-system/typography/typography';
import { MapPin, Star, Heart, Calendar, Users } from 'lucide-react';
import { Button } from "@/ui/design-system/button/button";

interface Logement {
  id: number | string;
  photo: string;
  titre: string;
  adresse: string;
  proprietaire: string;
  statutBail: string;
  type?: string;
  prix?: number;
  ville?: string;
  description?: string;
}

interface LogementsReservesProps {
  logements?: Logement[];
}

const statutMap = {
  "actif": { label: "Actif", color: "bg-green-100 text-green-700" },
  "en_fin": { label: "En fin", color: "bg-yellow-100 text-yellow-700" },
};

const typeColor: Record<string, string> = {
  studio: 'bg-gray-200',
  villa: 'bg-primary text-white',
  appartement: 'bg-blue-100 text-blue-700',
};

export const LogementsReserves: React.FC<LogementsReservesProps> = ({ logements }) => {
  if (!Array.isArray(logements) || logements.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6 mt-6 text-gray-400 text-center">
        Aucun logement réservé à afficher.
      </div>
    );
  }

  // Fonction pour générer une note aléatoire réaliste basée sur les données
  const generateRating = (logement: Logement) => {
    const hash = logement.id.toString().split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return (Math.abs(hash) % 20 + 80) / 10; // Note entre 8.0 et 10.0
  };

  // Fonction pour générer un nombre d'évaluations basé sur les données
  const generateEvaluations = (logement: Logement) => {
    const hash = logement.id.toString().split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash) % 500 + 50; // Entre 50 et 550 évaluations
  };

  return (
    <div className="rounded-xl shadow p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <Typography  variant="body-base">Mes logements réservés</Typography>
      </div>
      
      <div className="space-y-4">
        {logements.map((log) => {
          const statut = statutMap[log.statutBail] || statutMap["actif"];
          const img = log.photo || 'https://via.placeholder.com/400x300?text=Photo';
          const prix = log.prix ? `${log.prix.toLocaleString()} FCFA` : '--';
          const desc = log.description?.length && log.description.length > 100 ? log.description.slice(0, 100) + '…' : log.description;
          const type = log.type?.toLowerCase() || '';
          const rating = generateRating(log);
          const evaluations = generateEvaluations(log);
          
          return (
            <div
              key={log.id}
              className="rounded-[20px] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
            >
              <div className="flex items-center">
                {/* Image Section */}
                <div className="relative w-80 h-full overflow-hidden group flex-shrink-0">
                  <Image 
                    src={img} 
                    alt={log.titre} 
                    width={320} 
                    height={192} 
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" 
                  />
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                    <Heart size={16} className="text-gray" />
                  </button>
                </div>
                {/* Content Section */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <Typography variant='body-base'>
                          {log.titre}
                        </Typography>
                        <div className="flex items-center space-x-1 gap-1 mb-2">
                          {[...Array(4)].map((_, i) => (
                            <Star key={i} size={12} className="text-orange-400 fill-current" />
                          ))}
                          <Typography variant="body-base">{log.typ || 'Logement'}</Typography>
                        </div>
                        <Typography variant='body-base' className="flex items-center">
                          <MapPin size={14} className="text-gray" />
                          {log.adresse}
                        </Typography>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center space-x-1 gap-1">
                        <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                          <Typography variant="caption2">{rating.toFixed(1)}</Typography>
                        </div>
                        <Typography variant="body-base">Excellent</Typography>
                        <Typography variant="body-base">({evaluations} évaluations)</Typography>
                      </div>
              </div>
                    {desc && (
                      <Typography variant='body-sm' className="text-gray-600 mb-4">
                        {desc}
                  </Typography>
                    )}
                  </div>
                </div>
                <div className="pr-4">
                    <Button variant="accent">
                      Consulter  
                    </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};