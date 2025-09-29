import { useEffect, useState } from 'react';
import { Typography } from '@/ui/design-system/typography/typography';
import { PieceModalContainer } from '../../components/modal/PieceModal.container';
import { toast } from 'react-toastify';
import { OnboardingFooter } from './onboarding-footer';
import { Button } from '@/ui/design-system/button/button';
import { usePropertyOnboardingStore } from '../../context/propertyOnboarding.store';
import { Room } from '@/api/unit';
import Image from 'next/image';
import { ConfirmModal } from '../../components/modal/ConfirmModal';

export default function Step2Rooms({ propertyId: propPropertyId, unitId, goNext, goPrev, currentStep, totalSteps, store }: any) {
  const propertyIdStore = usePropertyOnboardingStore(state => state.propertyId);
  const propertyId = propPropertyId || propertyIdStore;
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.menu-container')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Charger les pièces
  useEffect(() => {
    if (!unitId) return;
    
    const loadRooms = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/unit/rooms?unitId=${unitId}`);
        const data = await response.json();
        console.log('[DEBUG][loadRooms] rooms data:', data);
        
        if (!response.ok) {
          throw new Error(data.error);
        }
        
        setRooms(data);
      } catch (error: any) {
        console.error('Erreur chargement pièces:', error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, [unitId, isModalOpen]);

  // Pré-remplissage depuis le store
  useEffect(() => {
    if (store.draftData && store.draftData[`unit_rooms_${unitId}`]) {
      setRooms(store.draftData[`unit_rooms_${unitId}`]);
    }
  }, [store.draftData, unitId]);

  const handlePieceSave = async (piece: any) => {
    try {
      // Création de la pièce
      const response = await fetch('/api/unit/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...piece,
          rental_unit_id: unitId,
          photos: undefined, // On ne transmet pas les fichiers ici
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      // Upload des photos si présentes
      if (piece.photos && piece.photos.length > 0) {
        for (const file of piece.photos) {
          const formData = new FormData();
          formData.append('file', file); // Correction ici
          await fetch(`/api/rooms/photos/${data.id}`, {
            method: 'POST',
            body: formData,
          });
        }
      }

      // Recharge la liste des pièces pour afficher les images
      const reload = await fetch(`/api/unit/rooms?unitId=${unitId}`);
      const roomsWithPhotos = await reload.json();
      setRooms(roomsWithPhotos);
      setIsModalOpen(false);
      store.updateDraftData({ [`unit_rooms_${unitId}`]: roomsWithPhotos });
      toast.success('Pièce ajoutée avec succès');
    } catch (error: any) {
      console.error('Erreur création pièce:', error);
      toast.error(error.message);
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteRoom = async (roomId: string) => {
    setIsDeleting(true);
    console.log('[DEBUG][handleDeleteRoom] Tentative suppression pièce, id:', roomId);
    try {
      const response = await fetch(`/api/unit/rooms/${roomId}`, {
        method: 'DELETE',
      });
      console.log('[DEBUG][handleDeleteRoom] response status:', response.status);
      let rawText = '';
      try {
        rawText = await response.clone().text();
        console.log('[DEBUG][handleDeleteRoom] response raw text:', rawText);
      } catch (e) {
        console.log('[DEBUG][handleDeleteRoom] Impossible de lire le texte brut de la réponse', e);
      }
      if (!response.ok) {
        let errorMsg = 'Erreur inconnue';
        try {
          const data = await response.json();
          console.log('[DEBUG][handleDeleteRoom] JSON error data:', data);
          errorMsg = data.error || errorMsg;
        } catch (jsonErr) {
          console.log('[DEBUG][handleDeleteRoom] JSON parse error:', jsonErr);
          try {
            const text = await response.text();
            console.log('[DEBUG][handleDeleteRoom] Text error data:', text);
            errorMsg = text || errorMsg;
          } catch (textErr) {
            console.log('[DEBUG][handleDeleteRoom] Text parse error:', textErr);
          }
        }
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      setRooms(prev => prev.filter(room => room.id !== roomId));
      store.updateDraftData({ [`unit_rooms_${unitId}`]: rooms.filter(room => room.id !== roomId) });
      toast.success('Pièce supprimée avec succès');
      console.log('[DEBUG][handleDeleteRoom] Suppression réussie, pièce supprimée du state.');
    } catch (error: any) {
      console.error('[DEBUG][handleDeleteRoom] Erreur suppression pièce:', error);
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
      setOpenMenuId(null);
    }
  };

  const handleDuplicateRoom = async (room: Room) => {
    try {
      const { id, created_at, updated_at, ...roomData } = room;
      const response = await fetch('/api/unit/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...roomData,
          name: `${roomData.name} (copie)`,
          rental_unit_id: unitId,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      setRooms(prev => [...prev, data]);
      store.updateDraftData({ [`unit_rooms_${unitId}`]: [...rooms, data] });
      toast.success('Pièce dupliquée avec succès');
    } catch (error: any) {
      console.error('Erreur duplication pièce:', error);
      toast.error(error.message);
    }
    setOpenMenuId(null);
  };

  const getRoomTypeIcon = (roomType: string) => {
    const icons: { [key: string]: string } = {
      'chambre': '🛏️',
      'salon': '🛋️',
      'cuisine': '🍳',
      'salle_de_bain': '🚿',
      'toilettes': '🚽',
      'balcon': '🌿',
      'terrasse': '☀️',
      'garage': '🚗',
      'cave': '🏠',
      'grenier': '🏠',
    };
    return icons[roomType.toLowerCase()] || '🏠';
  };

  // Affiche la photo réelle si elle existe, sinon image par défaut
  const getRoomImage = (room: any) => {
    console.log('[DEBUG][getRoomImage] room:', room);
    if (room && Array.isArray(room.photos) && room.photos.length > 0) {
      console.log('[DEBUG][getRoomImage] photos:', room.photos);
      const photo = typeof room.photos[0] === 'object' && room.photos[0] !== null ? room.photos[0].url : room.photos[0];
      console.log('[DEBUG][getRoomImage] photo utilisée:', photo);
      return photo;
    }
    const images: { [key: string]: string } = {
      'chambre': '/assets/images/studio.jpg',
      'salon': '/assets/images/studio1.jpg',
      'cuisine': '/assets/images/studio.jpg',
      'salle_de_bain': '/assets/images/studio1.jpg',
      'toilettes': '/assets/images/studio1.jpg',
      'balcon': '/assets/images/studio.jpg',
      'terrasse': '/assets/images/studio1.jpg',
      'garage': '/assets/images/studio.jpg',
      'cave': '/assets/images/studio1.jpg',
      'grenier': '/assets/images/studio.jpg',
    };
    const typeKey = typeof room?.room_type_id === 'string' ? room.room_type_id.toLowerCase() : '';
    console.log('[DEBUG][getRoomImage] fallback typeKey:', typeKey, 'url:', images[typeKey] || '/assets/images/room-default.svg');
    return images[typeKey] || '/assets/images/room-default.svg';
  };

  const totalSurface = rooms.reduce((sum, r) => sum + (r.surface || 0), 0);

  console.log('[DEBUG][Step2Rooms] goPrev:', typeof goPrev, goPrev);
  console.log('[DEBUG][Step2Rooms] currentStep:', currentStep, 'totalSteps:', totalSteps);

  return (
    <div>
      <Typography variant="h4">Ajouter les pièces</Typography>
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-800">
          <span className="font-medium">Surface totale des pièces :</span> <b>{totalSurface} m²</b>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">Chargement des pièces...</span>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {rooms.length === 0 && (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-4xl mb-2">🏠</div>
              <div>Aucune pièce ajoutée.</div>
              <div className="text-sm">Commencez par ajouter votre première pièce</div>
            </div>
          )}
          
          {rooms.map(room => (
            <div key={room.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex">
                {/* Image de la pièce */}
                <div className="w-24 h-24 relative flex-shrink-0">
                  <Image
                    src={getRoomImage(room)}
                    alt={room.name}
                    fill
                    className="object-cover rounded-l-lg"
                    onError={(e) => {
                      // Fallback vers une image par défaut
                      (e.target as HTMLImageElement).src = '/assets/images/room-default.svg';
                    }}
                  />
                  <div className="absolute top-2 left-2 text-2xl">
                    {getRoomTypeIcon(room.room_type_id || 'default')}
                  </div>
                </div>
                
                {/* Informations de la pièce */}
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{room.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          {room.surface} m²
                        </span>
                        {room.description && (
                          <span className="text-gray-500 truncate max-w-xs">
                            {room.description}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Menu d'actions */}
                    <div className="relative menu-container">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === room.id ? null : room.id)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      
                      {/* Menu déroulant */}
                      {openMenuId === room.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <div className="py-1">
                            <button
                              onClick={() => handleEditRoom(room)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDuplicateRoom(room)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Dupliquer
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(room.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Supprimer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Button
        action={() => {
          setEditingRoom(null);
          setIsModalOpen(true);
        }}
        variant="secondary"
        size='small'
        
      >
        <div className='flex items-center'>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <Typography variant='body-base'>
        Ajouter une pièce
        </Typography>
        </div>
      </Button>
      
      <PieceModalContainer
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRoom(null);
        }}
        onSave={handlePieceSave}
        initialData={editingRoom}
        property_id={propertyId}
        rental_unit_id={unitId}
      />

      <ConfirmModal
        open={!!confirmDeleteId}
        title="Supprimer la pièce ?"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer cette pièce ?"
        onConfirm={() => confirmDeleteId && handleDeleteRoom(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
        isLoading={isDeleting}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
      />

      <OnboardingFooter
        next={goNext}
        prev={goPrev}
        isFirstStep={() => currentStep === 1}
        isFinalStep={() => currentStep === totalSteps}
        isLoading={loading}
      />
    </div>
  );
} 