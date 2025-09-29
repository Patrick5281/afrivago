import React, { useEffect, useState } from 'react';
import { RoomDetails } from './room-details';

interface RoomType {
  id: string;
  name: string;
}

interface RoomPhoto {
  url: string;
}

interface RoomEquipment {
  id: string;
  name: string;
  quantity?: number;
}

interface Room {
  id: string;
  name: string;
  room_type: RoomType;
  surface: number;
  description?: string;
  photos: RoomPhoto[];
  room_equipments?: RoomEquipment[];
}

interface RoomDetailsContainerProps {
  id: string;
}

export const RoomDetailsContainer = ({ id }: RoomDetailsContainerProps) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) {
        setLoading(false);
        setError("L'ID de la pièce est manquant.");
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(`/api/details-property/rooms?id=${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Erreur ${response.status}`);
        }
        const data = await response.json();
        setRoom(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  if (loading) return <div className="text-center p-8">Chargement...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Erreur: {error}</div>;
  if (!room) return <div className="text-center p-8">Pièce non trouvée</div>;

  return <RoomDetails room={room} isModal={false} />;
}; 