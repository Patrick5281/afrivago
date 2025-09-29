import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { usePropertyOnboardingStore, PropertyType as StorePropertyType } from '../context/propertyOnboarding.store';
import { PropertyService, PropertyDraft } from '../services/property.service';
import { getPropertyTypes, getCountries } from '@/api/property';
import { PropertyType, Country } from '@/types/property';
import { OnboardingGeneralInfosStepFormFieldsType } from '@/types/forms';

export const useGeneralInfoStep = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);

  const {
    propertyId,
    setPropertyId,
    setPropertyType,
    updateDraftData
  } = usePropertyOnboardingStore();

  const {
    handleSubmit,
    control,
    formState: { errors },
    register,
    reset,
    setValue,
    watch,
    getValues
  } = useForm<OnboardingGeneralInfosStepFormFieldsType>();

  // Charger les types de propriétés et les pays
  useEffect(() => {
    const loadData = async () => {
      try {
        const [types, countriesData] = await Promise.all([
          getPropertyTypes(),
          getCountries()
        ]);
        setPropertyTypes(types);
        setCountries(countriesData);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast.error("Impossible de charger les données nécessaires");
      }
    };
    loadData();
  }, []);

  // Charger les données existantes
  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) return;
      setIsLoading(true);
      try {
        const { data, error } = await PropertyService.getDraft(propertyId);
        if (error) throw error;
        if (data) {
          // Convertir les données du draft en format de formulaire
          const formData: OnboardingGeneralInfosStepFormFieldsType = {
            title: data.title || '',
            property_type_id: data.property_type_id || '',
            country_id: data.country_id || '',
            city: data.city || '',
            district: data.district || '',
            postal_code: data.postal_code || '',
            full_address: data.full_address || '',
            surface: data.surface || 0,
            year_built: data.year_built,
            description: data.description || '',
            latitude: data.latitude,
            longitude: data.longitude
          };
          reset(formData);
          setPropertyType(data.property_type_id as StorePropertyType); // Synchronisation du store
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast.error("Impossible de charger les données du logement");
      } finally {
        setIsLoading(false);
      }
    };
    loadProperty();
  }, [propertyId, reset, setPropertyType]);

  // Synchroniser le store dès que le type change dans le formulaire
  useEffect(() => {
    watch((value: any, { name }: { name?: string }) => {
      if (name === 'property_type_id' && value.property_type_id) {
        setPropertyType(value.property_type_id as StorePropertyType);
      }
    });
  }, [watch, setPropertyType]);

  // Fonction asynchrone qui retourne un booléen pour la navigation
  const onSubmitRaw = async (formData: OnboardingGeneralInfosStepFormFieldsType) => {
    setIsLoading(true);
    try {
      let id = propertyId;
      if (!id) {
        const { data, error } = await PropertyService.createDraft();
        if (error) throw error;
        if (data?.id) {
          id = data.id;
          setPropertyId(id);
        }
      }
      if (id) {
        // Convertir les données du formulaire en format PropertyDraft
        const draftData: Partial<PropertyDraft> = {
          title: formData.title,
          property_type_id: formData.property_type_id,
          country_id: formData.country_id,
          city: formData.city,
          district: formData.district,
          postal_code: formData.postal_code,
          full_address: formData.full_address,
          surface: formData.surface,
          year_built: formData.year_built,
          description: formData.description,
          latitude: formData.latitude,
          longitude: formData.longitude
        };
        const { error } = await PropertyService.updateDraft(id, draftData);
        if (error) throw error;
        // Mettre à jour le store
        updateDraftData(formData);
        setPropertyType(formData.property_type_id as StorePropertyType);
        toast.success("Logement sauvegardé avec succès");
        return true;
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Une erreur est survenue lors de la sauvegarde");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form: {
      handleSubmit,
      control,
      register,
      errors,
      isLoading,
      getValues
    },
    propertyTypes,
    countries,
    onSubmit: handleSubmit(onSubmitRaw), // pour le formulaire
    onSubmitRaw
  };
}; 