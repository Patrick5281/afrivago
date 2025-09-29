import { useState, useEffect } from 'react';
import { PieceModalView } from './PieceModal.view';
import { toast } from 'react-toastify';

interface PieceModalContainerProps {
  open: boolean;
  onClose: () => void;
  onSave: (piece: any) => void;
  initialData?: any;
  property_id: string;
  rental_unit_id?: string;
}

export const PieceModalContainer = ({ open, onClose, onSave, initialData, property_id, rental_unit_id }: PieceModalContainerProps) => {
  const [form, setForm] = useState<any>(
    initialData || {
      id: '',
      name: '',
      room_type_id: '', 
      surface: '', // surface vide par défaut
      description: '',
    }
  );
  const [errors] = useState({});
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [equipmentQuantities, setEquipmentQuantities] = useState<Record<string, number>>({});
  const [customEquipments, setCustomEquipments] = useState<{ name: string; quantity: number }[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les types de pièces au montage
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        console.log('[DEBUG] Appel API pour récupérer les types de pièces');
        const response = await fetch('/api/rooms/types');
        console.log('[DEBUG] Réponse API:', response.status);
        const data = await response.json();
        console.log('[DEBUG] Types de pièces reçus:', data);
        setRoomTypes(data.types || []);
      } catch (error) {
        console.error('[ERROR] Erreur lors de la récupération des types:', error);
        setRoomTypes([]);
      }
    };
    fetchRoomTypes();
  }, []);

  // Charger les équipements possibles pour le type sélectionné
  useEffect(() => {
    if (form.room_type_id) {
      const fetchEquipments = async () => {
        try {
          const response = await fetch(`/api/rooms/equipments?roomTypeId=${form.room_type_id}`);
          const data = await response.json();
          setEquipments(data.equipments || []);
          setEquipmentQuantities({});
        } catch {
          setEquipments([]);
        }
      };
      fetchEquipments();
    } else {
      setEquipments([]);
      setEquipmentQuantities({});
    }
  }, [form.room_type_id]);

  // Initialiser les états à partir des données initiales
  useEffect(() => {
    if (initialData) {
      const { photos, ...formData } = initialData;
      setForm(formData);
      setExistingPhotos(photos || []);
      setPhotoPreviews(photos || []);
      setPhotos([]);
    } else {
      setForm({
        id: '',
        name: '',
        room_type_id: '',
        surface: '', // surface vide par défaut
        description: '',
      });
      setExistingPhotos([]);
      setPhotoPreviews([]);
      setPhotos([]);
    }
  }, [initialData]);

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleQuantityChange = (equipment_type_id: string, quantity: number) => {
    setEquipmentQuantities((prev) => ({ ...prev, [equipment_type_id]: quantity }));
  };

  const handleRemoveEquipment = (equipment_type_id: string) => {
    setEquipmentQuantities((prev) => {
      const copy = { ...prev };
      delete copy[equipment_type_id];
      return copy;
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const fileList = Array.from(e.target.files);
    const newPreviews = fileList.map(file => URL.createObjectURL(file));
    setPhotos(prev => [...prev, ...fileList]);
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Vérifie si un ID est un UUID valide
  const isValidUUID = (id: string): boolean => {
    if (!id) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Désormais, on ne fait plus d'appel API ici pour la création/édition de la pièce !
      // On transmet simplement les données du formulaire au parent
      await onSave({ ...form, photos });
      
      // Reset du formulaire après succès
      setForm({
        id: '',
        name: '',
        room_type_id: '',
        surface: '',
        description: '',
      });
      setPhotos([]);
      setPhotoPreviews([]);
      setExistingPhotos([]);
      setEquipmentQuantities({});
      setCustomEquipments([]);
      
      setIsLoading(false);
      onClose();
    } catch (error) {
      setIsLoading(false);
      console.error('Erreur complète:', error);
      let errMsg = 'Erreur inconnue';
      if (error instanceof Error) {
        errMsg = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errMsg = (error as any).message;
      } else {
        errMsg = JSON.stringify(error);
      }
      toast.error(`Erreur: ${errMsg}`);
    }
  };

  // Fonction pour supprimer une photo existante (déjà en base)
  const handleRemoveExistingPhoto = async (photoUrl: string) => {
    // Trouver l'id de la photo à partir de l'URL (il faut l'id côté front, sinon il faut l'ajouter dans le modèle Room)
    // Ici, on suppose que tu as un mapping url <-> id, sinon il faut adapter la récupération des pièces pour inclure l'id de chaque photo
    // Pour l'exemple, on va supposer que tu as un tableau existingPhotos sous forme [{id, url}]
    const photo = existingPhotos.find((p: any) => (typeof p === 'object' ? p.url : p) === photoUrl);
    if (!photo) return;
    
    try {
      // Si la photo est un objet avec un id, on l'utilise, sinon on utilise l'URL comme identifiant
      const photoId = typeof photo === 'object' && (photo as any).id ? (photo as any).id : photoUrl;
      await fetch(`/api/rooms/photos/${photoId}`, { method: 'DELETE' });
      setExistingPhotos((prev: any) => prev.filter((p: any) => (typeof p === 'object' ? p.url : p) !== photoUrl));
      setPhotoPreviews((prev: any) => prev.filter((p: any) => p !== photoUrl));
      toast.success('Photo supprimée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression de la photo');
    }
  };

  return (
    <PieceModalView
      open={open}
      form={form}
      onChange={handleChange}
      onClose={onClose}
      onSave={handleSave}
      errors={errors}
      roomTypes={roomTypes}
      equipments={equipments}
      equipmentQuantities={equipmentQuantities}
      onQuantityChange={handleQuantityChange}
      onRemoveEquipment={handleRemoveEquipment}
      customEquipments={customEquipments}
      setCustomEquipments={setCustomEquipments}
      photos={photos}
      setPhotos={setPhotos}
      successMsg={successMsg}
      isEdit={!!form.id && isValidUUID(form.id)}
      photoPreviews={photoPreviews}
      onPhotoChange={handlePhotoChange}
      onRemovePhoto={handleRemovePhoto}
      isLoading={isLoading}
      onRemoveExistingPhoto={handleRemoveExistingPhoto}
    />
  );
};