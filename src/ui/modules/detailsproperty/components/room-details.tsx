import React from 'react';
import Image from 'next/image';

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

interface Props {
  room: Room;
  onClose?: () => void;
  isModal?: boolean;
}

export const RoomDetails = ({ room, onClose, isModal = true }: Props) => {
  const content = (
    <div className={isModal ? "max-w-2xl w-full mx-4 bg-white rounded-xl shadow-lg overflow-hidden" : "max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{room.name}</h2>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <div className="text-gray-600">Type : {room.room_type?.name || 'N/A'}</div>
            <div className="text-gray-600">Surface : {room.surface} m²</div>
            {room.description && (
              <div className="mt-2 text-gray-700">{room.description}</div>
            )}
          </div>

          {room.room_equipments && room.room_equipments.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Équipements</h3>
              <div className="grid grid-cols-2 gap-2">
                {room.room_equipments.map((equipment) => (
                <div key={equipment.id} className="text-gray-600 bg-gray-50 p-2 rounded">
                    {equipment.name}
                  {equipment.quantity && equipment.quantity > 1 && (
                    <span className="text-sm text-gray-500 ml-1">(x{equipment.quantity})</span>
                  )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {room.photos && room.photos.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Photos</h3>
              <div className="grid grid-cols-2 gap-2">
                {room.photos.map((photo, idx) => (
                  <div key={idx} className="relative aspect-video rounded overflow-hidden">
                    <Image
                      src={photo.url}
                      alt={`Photo ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        {content}
    </div>
  );
  }

  return content;
};



