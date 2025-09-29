import { useForm } from 'react-hook-form';
import { Input } from '@/ui/design-system/forms/input';
import { Select } from '@/ui/design-system/forms/select';
import { Textarea } from '@/ui/design-system/forms/textarea';
import { useState, useEffect } from 'react';
import { Upload } from '@/ui/design-system/forms/upload';
import Image from 'next/image';

interface PieceFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
  equipments?: any[];
  onChange?: (field: string, value: any) => void;
  roomTypes?: any[];
  equipmentQuantities?: Record<string, number>;
  onQuantityChange?: (equipment_type_id: string, quantity: number) => void;
  onRemoveEquipment?: (equipment_type_id: string) => void;
  photos: File[];
  setPhotos: (files: File[]) => void;
  isEdit?: boolean;
  photoPreviews?: string[];
  onPhotoChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto?: (index: number) => void;
  customEquipments?: { name: string; quantity: number }[];
  setCustomEquipments?: (equipments: { name: string; quantity: number }[]) => void;
  existingPhotos?: any[];
  onRemoveExistingPhoto?: (url: string) => void;
}

export const PieceModalForm = ({
  onSubmit,
  initialData,
  isLoading,
  equipments = [],
  onChange,
  roomTypes = [],
  equipmentQuantities = {},
  onQuantityChange,
  onRemoveEquipment,
  photos,
  setPhotos,
  isEdit,
  photoPreviews = [],
  onPhotoChange,
  onRemovePhoto,
  customEquipments = [],
  setCustomEquipments,
  existingPhotos,
  onRemoveExistingPhoto,
}: PieceFormProps) => {
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [customEquipmentName, setCustomEquipmentName] = useState('');
  const [customEquipmentQuantity, setCustomEquipmentQuantity] = useState<number | ''>('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: initialData || {
      name: '',
      room_type_id: '',
      surface: '',
      description: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      // Reset du formulaire après soumission réussie
      reset({
        name: '',
        room_type_id: '',
        surface: '',
        description: '',
      });
      setSelectedEquipment(null);
      setCustomEquipmentName('');
      setCustomEquipmentQuantity('');
    } catch (error) {
      // En cas d'erreur, on ne reset pas le formulaire
      console.error('Erreur lors de la soumission:', error);
    }
  };

  return (
    <form className="w-full space-y-4 max-h-[70vh] overflow-y-auto pr-2" onSubmit={handleSubmit(handleFormSubmit)}>
      <Input
        label="Nom de la pièce"
        isLoading={isLoading}
        placeholder="Ex : Chambre parentale"
        type="text"
        register={register}
        errors={errors}
        errorMsg="Vous devez renseigner le nom de la pièce"
        id="name"
        required={true}
        onChange={e => onChange && onChange('name', e.target.value)}
      />
      <Select
        label="Type de pièce"
        id="room_type_id"
        register={register}
        errors={errors}
        required={true}
        options={roomTypes.map((rt: any) => ({ value: rt.id, label: rt.name }))}
        errorMsg="Vous devez sélectionner un type de pièce"
        defaultOption="Sélectionner le type"
        isLoading={isLoading}
        onChange={(e) => {
          register('room_type_id').onChange(e);
          if (onChange) onChange('room_type_id', e.target.value);
          setSelectedEquipment(null); // Réinitialiser l'équipement sélectionné
        }}
      />
      <Input
        label="Superficie (m²)"
        isLoading={isLoading}
        placeholder="Ex : 15"
        type="text"
        register={register}
        errors={errors}
        errorMsg="Vous devez renseigner la superficie"
        id="surface"
        required={true}
        onChange={e => onChange && onChange('surface', e.target.value)}
      />
      <Textarea
        label="Description courte"
        register={register}
        errors={errors}
        errorMsg="Vous devez renseigner une description"
        placeholder="Description de la pièce (max 200 caractères)"
        rows={3}
        isLoading={!!isLoading}
        required
        id="description"
      />
      <label className="block text-sm font-medium text-gray-700">Photos de la pièce</label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={onPhotoChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
        disabled={isLoading}
      />
      {photoPreviews.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-2">
          {photoPreviews.map((photo: string, index: number) => (
            <div key={index} className="relative">
              <Image
                src={photo}
                alt={`Aperçu ${index + 1}`}
                className="h-24 w-full object-cover rounded"
                width={200}
                height={96}
              />
              <button
                type="button"
                onClick={() => onRemovePhoto && onRemovePhoto(index)}
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
     
      <button type="submit" className="hidden" />
    </form>
  );
}; 