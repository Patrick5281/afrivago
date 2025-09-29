import { Button } from '@/ui/design-system/button/button';
import { Typography } from '@/ui/design-system/typography/typography';
import { PieceModalForm } from './PieceModal.form';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';

export const PieceModalView = ({
  open,
  onClose,
  onSave,
  initialData,
  isLoading,
  equipments,
  onChange,
  roomTypes, // Ajout de roomTypes dans la destructuration
  equipmentQuantities,
  onQuantityChange,
  form,
  errors,
  onRemoveEquipment,
  customEquipments,
  setCustomEquipments,
  photos,
  setPhotos,
  isEdit,
  photoPreviews,
  onPhotoChange,
  onRemovePhoto,
  existingPhotos,
  onRemoveExistingPhoto,
}: any) => {
  // Empêcher le scroll de l'arrière-plan quand le modal est ouvert
  useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [open]);

  // Reset du modal quand il se ferme
  useEffect(() => {
    if (!open) {
      // Nettoyer les classes CSS
      document.body.classList.remove('overflow-hidden');
    }
  }, [open]);

  console.log('PieceModalView rendu - open:', open);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg relative animate-fade-in-up">
        <Typography variant="caption1" className="font-bold text-lg mb-4">
          {isEdit ? 'Modifier la pièce' : 'Ajouter une pièce'}
        </Typography>
        <PieceModalForm
          onSubmit={onSave}
          initialData={form || initialData}
          isLoading={isLoading}
          equipments={equipments}
          onChange={onChange}
          roomTypes={roomTypes} // Transmission de roomTypes au formulaire
          equipmentQuantities={equipmentQuantities}
          onQuantityChange={onQuantityChange}
          onRemoveEquipment={onRemoveEquipment}
          customEquipments={customEquipments}
          setCustomEquipments={setCustomEquipments}
          photos={photos}
          setPhotos={setPhotos}
          isEdit={isEdit}
          photoPreviews={photoPreviews}
          onPhotoChange={onPhotoChange}
          onRemovePhoto={onRemovePhoto}
        />
        <div className="flex justify-between gap-4 mt-8">
          <Button variant="danger" action={onClose} type="button" disabled={isLoading}>
            Annuler
          </Button>
          <Button
            variant="secondary"
            size='small'
            action={onSave}
            type="button"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isEdit ? 'Mettre à jour' : 'Ajouter cette pièce'}
          </Button>
        </div>
        {/* Section photos avec prévisualisation */}
       
        {/* Affichage des photos déjà uploadées (si pas de nouvelles sélectionnées) */}
        {photoPreviews.length === 0 && existingPhotos && existingPhotos.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-2">
            {existingPhotos.map((photo: any, index: number) => (
              <div key={photo.id || photo} className="relative">
                <Image
                  src={typeof photo === 'object' ? photo.url : photo}
                  alt={`Aperçu existant ${index + 1}`}
                  className="h-24 w-full object-cover rounded"
                  width={200}
                  height={96}
                />
                <button
                  type="button"
                  onClick={() => onRemoveExistingPhoto && onRemoveExistingPhoto(typeof photo === 'object' ? photo.url : photo)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};