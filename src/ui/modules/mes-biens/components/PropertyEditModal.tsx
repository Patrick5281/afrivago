import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface Property {
  id: string;
  title: string;
  city: string;
  surface: number;
  statut: string;
}

interface Props {
  property: Property;
  onClose: () => void;
  onSave: (updated: Property) => void;
}

const PropertyEditModal: React.FC<Props> = ({ property, onClose, onSave }) => {
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<Property>({
    defaultValues: property
  });

  useEffect(() => {
    setValue('title', property.title);
    setValue('city', property.city);
    setValue('surface', property.surface);
    setValue('statut', property.statut);
  }, [property, setValue]);

  const onSubmit = async (data: Property) => {
    try {
      const response = await fetch(`/api/property/user-properties?propertyId=${property.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }
      const updated = await response.json();
      onSave(updated);
      onClose();
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>✕</button>
        <h2 className="text-2xl font-bold mb-4">Éditer le bien</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Titre</label>
            <input className="w-full border rounded p-2" {...register('title', { required: true })} />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Ville</label>
            <input className="w-full border rounded p-2" {...register('city', { required: true })} />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Surface (m²)</label>
            <input type="number" className="w-full border rounded p-2" {...register('surface', { required: true, min: 1 })} />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Statut</label>
            <select className="w-full border rounded p-2" {...register('statut', { required: true })}>
              <option value="draft">Brouillon</option>
              <option value="publie">Publié</option>
              <option value="en_attente">En attente</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>Annuler</button>
            <button type="submit" className="px-4 py-2 rounded bg-primary text-white" disabled={isSubmitting}>Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyEditModal; 