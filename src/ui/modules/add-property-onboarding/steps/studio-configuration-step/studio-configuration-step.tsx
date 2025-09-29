import { BaseComponentProps } from "@/types/onboarding-steps-List";
import { OnboardingFooter } from "../../components/footer/onboarding-footer";
import { Container } from "@/ui/components/container/container";
import { Typography } from "@/ui/design-system/typography/typography";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { PieceModalContainer } from "../../components/modal/PieceModal.container"; 
import { Button } from "@/ui/design-system/button/button";
import { toast } from "react-toastify"; 
import { usePropertyOnboardingStore } from '../../context/propertyOnboarding.store';
import { Edit2, Trash2, Plus, MoreHorizontal, ImageIcon, Camera } from "lucide-react";
import Image from "next/image";

interface StudioFormData {
  surface: number;
  description: string;
  photos: File[];
  equipments: Record<string, number>;
}

interface Room {
  id?: string;
  name: string;
  surface: number;
  description: string;
  photos: string[];
  room_type_id: string;
}

const RoomCard = ({ room, index, onEdit, onDelete }: {
  room: Room;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="group relative bg-gray-400 rounded border border-primary hover:border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Image de fond ou placeholder */}
      <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        {room.photos?.[0] ? (
          <Image
            src={room.photos[0]} 
            alt={room.name}
            width={200}
            height={192}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageIcon className="w-12 h-12 text-gray-300" />
          </div>
        )}
        
        {/* Badge nombre de photos */}
        {room.photos && room.photos.length > 0 && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Camera className="w-3 h-3" />
            {room.photos.length}
          </div>
        )}
        
        {/* Menu actions - visible au hover */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-600" />
            </button>
            
            {showActions && (
              <div className="absolute top-full mt-1 bg-gray-500 rounded-lg shadow-lg rounded py-1 z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    onEdit();
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setShowActions(false);
                  }}
                  className="w-full px-3 pb-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Contenu de la carte */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Typography variant="body-lg" className="font-semibold text-gray-900 truncate flex-1">
            {room.name}
          </Typography>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-gray">
          <span className="bg-gray-100 py-1 rounded-full font-medium">
           {room.surface} m²
          </span>
        </div>

         {/*room.description && (
          <Typography variant="body-sm" className="text-gray-600 mt-2 line-clamp-2">
            {room.description}
          </Typography>
        )*/}

      </div>
    </div>
  );
};

const EmptyState = ({ onAddRoom }: { onAddRoom: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <Image
            src= '\assets\images\logement.svg'
            alt= 'recherche'
            width={200}
            height={192}
            className="w-full h-full object-cover"
          />
    <Typography variant="body-lg" className="text-gray-900 mb-2">
      Aucun studio enregistré pour le moment
    </Typography>
  </div>
);

export const StudioConfigurationStep = ({
  prev,
  next,
  isFirstStep,
  isFinalStep,
  handleStepSubmit,
}: BaseComponentProps) => {
  const propertyId = usePropertyOnboardingStore(state => state.propertyId);
  const [localLoading, setLocalLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const { handleSubmit, reset } = useForm<StudioFormData>();

  // Charger les pièces avec leurs photos
  const loadRoomsWithPhotos = async (): Promise<Room[]> => {
    if (!propertyId) return [];
    try {
      const res = await fetch(`/api/rooms?propertyId=${propertyId}`);
      if (!res.ok) throw new Error('Erreur lors du chargement des pièces');
      return await res.json();
    } catch (error) {
      console.error('Erreur lors du chargement des pièces:', error);
      return [];
    }
  };

  // Initialisation
  useEffect(() => {
    const fetchData = async () => {
      if (!propertyId) return;
      setLocalLoading(true);
      try {
        console.log('propertyId utilisé:', propertyId);
        // Charger les pièces
        const roomsWithPhotos = await loadRoomsWithPhotos();
        console.log('Rooms chargées:', roomsWithPhotos);
        setRooms(roomsWithPhotos);
      } finally {
        setLocalLoading(false);
      }
    };
    fetchData();
  }, [propertyId, reset]);

  // Gestion des pièces
  const handleAddRoom = async (room: Room) => {
    try {
      let createdRoomId = null;
      if (editingRoom) {
        // Edition
        await fetch('/api/property/rooms', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(room)
        });
        createdRoomId = room.id;
      } else {
        // Création
        const res = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...room, property_id: propertyId })
        });
        const data = await res.json();
        createdRoomId = data.room?.id;
        // UPLOAD PHOTOS si besoin
        if (room.photos && room.photos.length > 0 && createdRoomId) {
          for (const file of room.photos) {
            const formData = new FormData();
            formData.append('file', file);
            await fetch(`/api/rooms/photos/${createdRoomId}`, {
              method: 'POST',
              body: formData
            });
          }
        }
      }
      const updatedRooms = await loadRoomsWithPhotos();
      setRooms(updatedRooms);
      toast.success(editingRoom ? 'Pièce modifiée avec succès' : 'Pièce ajoutée avec succès');
      setIsModalOpen(false);
      setEditingRoom(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde de la pièce');
    }
  };

  const handleDeleteRoom = async (idx: number) => {
    const room = rooms[idx];
    if (!room.id) {
      setRooms(rooms.filter((_, i) => i !== idx));
      return;
    }
    try {
      await fetch(`/api/rooms/${room.id}`, {
        method: 'DELETE',
      });
      setRooms(rooms.filter((_, i) => i !== idx));
      toast.success('Pièce supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de la pièce');
    }
  };

  const onSubmit = async (data: StudioFormData) => {
    try {
      setLocalLoading(true);
      await fetch('/api/property/rooms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, surface: data.surface, description: data.description })
      });
      if (handleStepSubmit) {
        await handleStepSubmit(data);
      }
      next();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLocalLoading(false);
    }
  };

  const openModal = (room?: Room) => {
    setEditingRoom(room || null);
    setIsModalOpen(true);
  };

  // Ajout d'un log juste avant le rendu principal
  console.log('State rooms juste avant rendu:', rooms);

  return (
    <div className="relative h-screen pb-[91px]">
      <div className="h-full overflow-auto pt-0">
    <Container className="flex h-full w-full">
      {/* Section gauche - 70% */}
      <div className="w-[70%] h-full flex items-center">
        <div className="w-[70%] space-y-6">
          <div>
            <Typography variant="h2" component="div" className="mb-3">
                Configuration de votre studio
              </Typography>
            <Typography variant="body-base" theme="gray">
                Ajoutez les détails de votre studio pour le rendre plus attractif pour les futurs locataires.
              </Typography>
          </div>

          {rooms.length == 0 && (
              <Button
              action={() => openModal()}
            >
              Ajouter une pièce
              </Button>
          )}
            </div>
          </div>

      {/* Section droite - 30% */}
      <div className="w-[30%] h-full flex items-center">
        <div className="w-full">
          {rooms.length === 0 ? (
            <EmptyState onAddRoom={() => openModal()} />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {rooms.map((room, index) => (
                <RoomCard
                  key={room.id || index}
                  room={room}
                  index={index}
                  onEdit={() => openModal(room)}
                  onDelete={() => handleDeleteRoom(index)}
                />
              ))}
            </div>
          )}
            </div>
          </div>
        </Container>

        <PieceModalContainer
          open={isModalOpen}
          onClose={() => { 
        setIsModalOpen(false);
        setEditingRoom(null);
          }}
      onSave={handleAddRoom}
          initialData={editingRoom}
          property_id={propertyId || ""}
        />
      </div>

      <OnboardingFooter
        prev={prev}
        next={handleSubmit(onSubmit)}
        isFirstStep={isFirstStep}
        isFinalStep={isFinalStep}
        isLoading={localLoading}
      />
    </div>

  );
}; 