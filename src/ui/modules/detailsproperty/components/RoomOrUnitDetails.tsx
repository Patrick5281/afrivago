import React, { useState } from 'react';
import Image from 'next/image';

interface Equipment {
  id: string;
  name: string;
}

interface Room {
  id: string;
  name: string;
  surface: number;
  description?: string;
  photos?: string[];
  room_equipments?: Equipment[];
}

interface RoomOrUnit {
  id: string;
  name: string;
  surface?: number;
  description?: string;
  photos?: string[];
  room_equipments?: Equipment[];
  rooms?: Room[]; // pour unité locative
}

interface Props {
  data: RoomOrUnit;
  onClose?: () => void;
}

export const RoomOrUnitDetails: React.FC<Props> = ({ data, onClose }) => {
  // Récupère toutes les images (pièce ou toutes les pièces de l'unité)
  const images = data.photos && data.photos.length > 0
    ? data.photos
    : data.rooms && data.rooms.length > 0
      ? data.rooms.flatMap(r => r.photos || [])
      : ['/placeholder.jpg'];
  const [imgIdx, setImgIdx] = useState(0);
  const prevImg = () => setImgIdx((prev) => (prev - 1 + images.length) % images.length);
  const nextImg = () => setImgIdx((prev) => (prev + 1) % images.length);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden my-10">
      {/* Diaporama d'images */}
      <div className="relative w-full h-[340px] bg-gray-100">
        {images.length > 1 && (
          <button
            onClick={prevImg}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow transition"
          >
            ◀
          </button>
        )}
        <Image
          src={images[imgIdx]}
          alt={`Photo ${imgIdx + 1}`}
          fill
          className="object-cover transition-all duration-300 rounded-t-2xl"
        />
        {images.length > 1 && (
          <button
            onClick={nextImg}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow transition"
          >
            ▶
          </button>
        )}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${i === imgIdx ? 'bg-blue-600' : 'bg-gray-300'}`}
            />
          ))}
        </div>
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full p-2 shadow">
            ✕
          </button>
        )}
      </div>
      {/* Détails */}
      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{data.name}</h2>
        {data.surface && (
          <div className="mb-2">
            <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              Surface : {data.surface} m²
            </span>
          </div>
        )}
        {data.description && <p className="text-gray-700 mb-4">{data.description}</p>}
        {/* Equipements */}
        {data.room_equipments && data.room_equipments.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Équipements</h3>
            <ul className="flex flex-wrap gap-3">
              {data.room_equipments.map(eq => (
                <li key={eq.id} className="bg-gray-100 px-3 py-1 rounded text-gray-800 text-sm flex items-center gap-2">
                  {eq.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Liste des pièces pour une unité locative */}
        {data.rooms && data.rooms.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Pièces de l'unité</h3>
            <ul className="list-disc ml-6 text-gray-700">
              {data.rooms.map(r => (
                <li key={r.id}>{r.name} ({r.surface} m²)</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}; 