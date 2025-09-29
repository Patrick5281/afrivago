import { BaseComponentProps } from "@/types/onboarding-steps-List";
import { OnboardingTabs } from "../../components/tabs/onboarding-tabs";
import { OnboardingFooter } from "../../components/footer/onboarding-footer";
import { Container } from "@/ui/components/container/container";
import { Typography } from "@/ui/design-system/typography/typography";
import { useState, useEffect } from "react";
import Image from "next/image";
import { PieceModalContainer } from "../../components/modal/PieceModal.container"; 
import { Button } from "@/ui/design-system/button/button";
import { usePropertyOnboardingStore } from "../../context/propertyOnboarding.store";
import { MoreVertical, ImageIcon, Camera } from "lucide-react";

interface Room {
  id?: string;
  rental_unit_id?: string;
  property_id?: string;
  room_type_id?: string;
  name: string;
  surface?: number;
  description?: string;
  created_at?: string;
  photos?: string[];
}

export const EntirePropertyStep = ({
  prev,
  next,
  isFirstStep,
  isFinalStep,
  stepsList,
  getCurrentStep,
  handleStepSubmit,
  isLoading,
}: BaseComponentProps) => {
  const [localLoading, setLocalLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [openMenuIdx, setOpenMenuIdx] = useState<number | null>(null);
  const propertyId = usePropertyOnboardingStore(state => state.propertyId);

  // Charger les pièces au montage
  useEffect(() => {
    const loadRoomsData = async () => {
      if (!propertyId) return;
      setLocalLoading(true);
      try {
        const res = await fetch(`/api/property/rooms-entire?propertyId=${propertyId}`);
        if (!res.ok) throw new Error('Erreur lors du chargement des pièces');
        const roomsData = await res.json();
        setRooms(roomsData || []);
      } catch (error) {
        console.error('[EntirePropertyStep] Erreur lors du chargement des pièces:', error);
      } finally {
        setLocalLoading(false);
      }
    };
    loadRoomsData();
  }, [propertyId]);

  // Recharge les pièces à chaque fois que ce step devient actif
  useEffect(() => {
    const currentStep = getCurrentStep ? getCurrentStep() : undefined;
    // La comparaison est simplifiée pour vérifier si l'ID de l'étape correspond
    const isCurrentStep = currentStep && currentStep.id === 'entire-property-step';

    if (isCurrentStep) {
      const reloadRooms = async () => {
        if (!propertyId) return;
        setLocalLoading(true);
        try {
          const res = await fetch(`/api/property/rooms-entire?propertyId=${propertyId}`);
          if (!res.ok) throw new Error('Erreur lors du chargement des pièces');
          const roomsData = await res.json();
          setRooms(roomsData || []);
        } catch (error) {
          console.error('[EntirePropertyStep] Erreur lors du rechargement des pièces:', error);
        } finally {
          setLocalLoading(false);
        }
      };
      reloadRooms();
    }
  }, [getCurrentStep, propertyId]);

  // Ajout ou édition d'une pièce
  const handleAddRoom = async (roomForm: any) => {
    try {
      setLocalLoading(true);
      let newRoom = null;
      // Création ou édition
      if (editingRoom?.id) {
        // Update
        const res = await fetch('/api/property/rooms-entire', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: editingRoom.id, room: roomForm })
        });
        if (!res.ok) throw new Error('Erreur lors de la mise à jour de la pièce');
        newRoom = await res.json();
      } else {
        // Create
        const res = await fetch('/api/property/rooms-entire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...roomForm, property_id: propertyId })
        });
        if (!res.ok) throw new Error('Erreur lors de la création de la pièce');
        newRoom = await res.json();
        // Upload des photos si besoin
        if (roomForm.photos && roomForm.photos.length > 0 && newRoom.id) {
          for (const file of roomForm.photos) {
            const formData = new FormData();
            formData.append('file', file);
            await fetch(`/api/rooms/photos/${newRoom.id}`, {
              method: 'POST',
              body: formData,
            });
          }
        }
      }
      // Recharger toute la liste pour avoir la pièce avec ses images
      const reload = await fetch(`/api/property/rooms-entire?propertyId=${propertyId}`);
      const roomsData = await reload.json();
      setRooms(roomsData || []);
      setIsModalOpen(false);
      setEditingRoom(null);
    } catch (error) {
      console.error('[EntirePropertyStep] Erreur lors de la sauvegarde de la pièce:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  // Suppression d'une pièce
  const handleDeleteRoom = async (roomId: string) => {
    try {
      setLocalLoading(true);
      const res = await fetch('/api/property/rooms-entire', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId })
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression de la pièce');
      setRooms(rooms.filter(r => r.id !== roomId));
    } catch (error) {
      console.error('[EntirePropertyStep] Erreur lors de la suppression de la pièce:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  // Soumission du step - passer au step suivant
  const handleNextStep = async () => {
    if (!propertyId) {
      console.error("L'ID de la propriété est manquant. Impossible de continuer.");
      return;
    }
    
    setLocalLoading(true);
    try {
      // Mise à jour du rental_type à 'entire'
      const response = await fetch(`/api/property/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rental_type: 'entire' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Une erreur est survenue lors de la mise à jour du type de location.");
      }

      console.log('[EntirePropertyStep] Type de location mis à jour à "entire"');
      console.log('[EntirePropertyStep] Nombre de pièces configurées:', rooms.length);

      if (handleStepSubmit) {
        await handleStepSubmit({ rooms: rooms.length });
      }

      if (next) {
        next();
      }
    } catch (error) {
      console.error('[EntirePropertyStep] Erreur lors de la soumission:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="relative h-screen pb-[91px]">
      <div className="h-full overflow-auto pt-0">
        <Container className="grid h-full grid-cols-12">
          <div className="relative z-10 flex items-center h-full col-span-6 py-10">
            <div className="w-full space-y-5 pb-4.5">
             
              <Typography variant="h3" component="h1">
                Configuration des pièces
              </Typography>
              <Typography variant="body-base" component="p" theme="gray">
                Ajoutez toutes les pièces de votre logement pour le rendre plus attractif pour les futurs locataires.
              </Typography>

              {/* Bouton d'ajout de pièce */}
              <Button
                action={() => { 
                  console.log('[EntirePropertyStep] Bouton Ajouter une pièce cliqué');
                  setEditingRoom(null); 
                  setIsModalOpen(true); 
                }}
                variant="accent"
                size="medium"
              >
                Ajouter une pièce
              </Button>
              
              {/* Liste des pièces */}
              <div className="space-y-4">
                {rooms.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-lg">
                    <Typography variant="body-base" theme="gray">
                      Aucune pièce ajoutée pour le moment. Cliquez sur "Ajouter une pièce" pour commencer.
                    </Typography>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {rooms.map((room, index) => (
                      <div key={room.id} className="group relative bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
                        {/* Image de fond ou placeholder */}
                        <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                          {room.photos?.[0] ? (
                            <Image
                              src={room.photos[0]} 
                              alt={room.name}
                              width={400}
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
                          
                          {/* Menu actions - icône trois points */}
                          <div className="absolute top-3 left-3">
                            <div className="relative">
                              <button
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setOpenMenuIdx(openMenuIdx === index ? null : index); 
                                }}
                                className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-600" />
                              </button>
                              
                              {openMenuIdx === index && (
                                <div className="absolute top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                                  <button
                                    onClick={() => { 
                                      setOpenMenuIdx(null);
                                      console.log('[EntirePropertyStep] Modification de la pièce:', room.id);
                                      setEditingRoom(room);
                                      setIsModalOpen(true);
                                    }}
                                    className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                  >
                                    Modifier
                                  </button>
                                  <button
                                    onClick={() => { 
                                      setOpenMenuIdx(null);
                                      // Option pour dupliquer (à implémenter si nécessaire)
                                    }}
                                    className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                  >
                                    Dupliquer
                                  </button>
                                  <button
                                    onClick={() => { 
                                      setOpenMenuIdx(null);
                                      room.id && handleDeleteRoom(room.id);
                                    }}
                                    className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                  >
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
                          
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="bg-gray-100 py-1 px-2 rounded-full font-medium">
                              {room.surface}m²
                            </span>
                          </div>

                          {room.description && (
                            <Typography variant="body-sm" className="text-gray-600 mt-2 line-clamp-2">
                              {room.description}
                            </Typography>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Résumé */}
              {rooms.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Typography variant="body-base" component="p" className="font-medium">
                    Résumé: {rooms.length} pièce{rooms.length > 1 ? 's' : ''} configurée{rooms.length > 1 ? 's' : ''}
                  </Typography>
                  <Typography variant="body-sm" theme="gray">
                    Surface totale: {rooms.reduce((total, room) => total + (room.surface || 0), 0)}m²
                  </Typography>
                </div>
              )}
            </div>
          </div>
          
          {/* Image illustration */}
          <div className="flex items-center h-full col-span-6">
            <div className="w-full flex justify-center">
              <Image
                src="/images/entire-property-illustration.svg"
                alt="Configuration des pièces"
                width={399}
                height={255}
              />
            </div>
          </div>
        </Container>

        {/* Modal pour l'ajout/édition de pièces */}
        <PieceModalContainer
          open={isModalOpen}
          onClose={() => { 
            console.log('[EntirePropertyStep] Fermeture du modal');
            setIsModalOpen(false); 
            setEditingRoom(null); 
          }}
          onSave={handleAddRoom}
          initialData={editingRoom}
          property_id={propertyId || ""}
        />
      </div>
      
      {/* Footer avec navigation */}
      <OnboardingFooter
        prev={prev}
        next={handleNextStep}
        isFirstStep={isFirstStep}
        isFinalStep={isFinalStep}
        isLoading={localLoading || isLoading}
      />
    </div>
  );
};