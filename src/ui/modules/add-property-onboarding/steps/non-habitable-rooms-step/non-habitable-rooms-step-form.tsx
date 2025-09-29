// non-habitable-rooms-step.form.tsx
import { Typography } from '@/ui/design-system/typography/typography';
import { Input } from '@/ui/design-system/forms/input';
import { FormsType } from '@/types/forms';
import { NonHabitableRoomType } from '@/types/property';

interface Props {
  roomTypes: NonHabitableRoomType[];
  selectedRooms: { [id: string]: { quantity: number; surface: number } };
  setSelectedRooms: (rooms: { [id: string]: { quantity: number; surface: number } }) => void;
  form: FormsType;
}

export const NonHabitableRoomsForm = ({
  roomTypes,
  selectedRooms,
  setSelectedRooms,
  form,
}: Props) => {
  const { isLoading } = form;

  const toggleRoom = (id: string) => {
    console.log('[DEBUG] toggleRoom appelé pour', id, 'état actuel:', selectedRooms);
    if (selectedRooms[id]) {
      const updated = { ...selectedRooms };
      delete updated[id];
      setSelectedRooms(updated);
      console.log('[DEBUG] Pièce retirée:', id, 'nouvel état:', updated);
    } else {
      const newState = {
        ...selectedRooms,
        [id]: { quantity: 1, surface: 1 },
      };
      setSelectedRooms(newState);
      console.log('[DEBUG] Pièce ajoutée:', id, 'nouvel état:', newState);
    }
  };

  const updateRoom = (id: string, field: 'quantity' | 'surface', value: number) => {
    if (selectedRooms[id]) {
      const newState = {
        ...selectedRooms,
        [id]: {
          ...selectedRooms[id],
          [field]: value,
        },
      };
      setSelectedRooms(newState);
      console.log('[DEBUG] updateRoom', id, field, value, 'nouvel état:', newState);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {roomTypes.map((room) => (
          <div key={room.id} className="flex flex-col gap-2 border rounded p-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!selectedRooms[room.id]}
                onChange={() => toggleRoom(room.id)}
              />
              <Typography variant="body-base">{room.name}</Typography>
            </label>
            {selectedRooms[room.id] && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  type="int"
                  min={1}
                  value={selectedRooms[room.id].quantity}
                  onChange={(e) => updateRoom(room.id, 'quantity', parseInt(e.target.value))}
                  isLoading={isLoading}
                />
                <Input
                  label="Superficie (m²)"
                  type="int"
                  min={1}
                  value={selectedRooms[room.id].surface}
                  onChange={(e) => updateRoom(room.id, 'surface', parseInt(e.target.value))}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
