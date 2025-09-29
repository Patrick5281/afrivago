import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import ReservationForm from '@/ui/modules/detailsproperty/components/reservation-form';
import { Button } from '@/ui/design-system/button/button';

interface UnitDetailsProps {
  id: string;
}

export const UnitDetails = ({ id }: UnitDetailsProps) => {
  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);

  useEffect(() => {
    const fetchUnit = async () => {
      if (!id) {
        setLoading(false);
        setError("L'ID de l'unité est manquant.");
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(`/api/units/${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Erreur ${response.status}`);
        }
        const data = await response.json();
        setUnit(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUnit();
  }, [id]);

  if (loading) return <div className="text-center p-8">Chargement...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Erreur: {error}</div>;
  if (!unit) return <div className="text-center p-8">Unité locative non trouvée</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-2">{unit.name}</h1>
      <div className="mb-2 text-gray-600">Prix : {unit.price_per_month} FCFA/mois</div>
      {unit.description && <div className="mb-4 text-gray-700">{unit.description}</div>}
      {unit.rooms && unit.rooms.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Pièces de l'unité :</h2>
          <ul className="list-disc ml-6">
            {unit.rooms.map((room: any) => (
              <li key={room.id} className="mb-2">
                <div className="font-medium">{room.name} ({room.surface} m²)</div>
                {room.room_photos && room.room_photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {room.room_photos.map((photo: any, idx: number) => (
                      <div key={idx} className="relative w-full aspect-video rounded overflow-hidden">
                        <Image src={photo.url} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="text-sm text-gray-400 mb-4">ID : {unit.id}</div>
      <Button
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg mt-4"
        action={() => setShowReservationModal(true)}
      >
        Réserver cette unité
      </Button>
      {showReservationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 relative">
            <ReservationForm
              propertyType="unit"
              rentalUnitId={unit.id}
              monthlyRent={unit.price_per_month}
              propertyName={unit.name}
              location={unit.location || ''}
              maxGuests={unit.max_guests || 4}
              onClose={() => setShowReservationModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};



