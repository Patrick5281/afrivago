// GeneralInfoStep.tsx - Version avec debug
import { BaseComponentProps } from "@/types/onboarding-steps-List";
import { OnboardingTabs } from "../../components/tabs/onboarding-tabs";
import { OnboardingFooter } from "../../components/footer/onboarding-footer";
import { Container } from "@/ui/components/container/container";
import { Typography } from "@/ui/design-system/typography/typography";
import { SubmitHandler, useForm } from "react-hook-form";
import { OnboardingGeneralInfosStepFormFieldsType } from "@/types/forms";
import { useToggle } from "@/hooks/use-toggle";
import { GeneralInfoStepForm } from "./general-infos-step-form";
import { useAuth } from "@/Context/AuthUserContext";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { PropertyType, Country } from "@/types/property";
import { usePropertyOnboarding } from "@/Context/PropertyOnboardingContext";
import { usePropertyOnboardingStore } from '../../context/propertyOnboarding.store';

export const GeneralInfoStep = ({
  prev,
  next,
  isFirstStep,
  isFinalStep,
  stepsList,
  getCurrentStep,
  handleStepSubmit,
  isLoading,
}: BaseComponentProps) => {
  const { authUser } = useAuth();
  console.log('[DEBUG] authUser au rendu du composant:', authUser);
  const { value: isLoadingForm, setvalue: setLoadingForm } = useToggle();
  const [countries, setCountries] = useState<Country[]>([]);
  
  // Utiliser uniquement le store pour l'id du property
  const propertyId = usePropertyOnboardingStore(state => state.propertyId);
  const setPropertyId = usePropertyOnboardingStore(state => state.setPropertyId);
  const setPropertyTypeStore = usePropertyOnboardingStore(state => state.setPropertyType);
  const setCurrentStep = usePropertyOnboardingStore(state => state.setCurrentStep);
  const steps = usePropertyOnboardingStore(state => state.steps);
  const propertyType = usePropertyOnboardingStore(state => state.propertyType);
  const rentalType = usePropertyOnboardingStore(state => state.rentalType);

  // DEBUG: Vérifier la valeur du propertyId
  console.log('[DEBUG] propertyId from store:', propertyId);

  const {
    handleSubmit,
    control,
    formState: { errors, isDirty },
    register,
    reset,
    setValue,
    watch,
    getValues
  } = useForm<OnboardingGeneralInfosStepFormFieldsType>();

  // DEBUG: Surveiller les valeurs du formulaire
  const formValues = watch();
  console.log('[DEBUG] Current form values:', formValues);

  // Charger les pays
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('[DEBUG] Début du chargement des pays...');
        const response = await fetch('/api/step/countries');
        console.log('[DEBUG] Réponse brute du fetch countries:', response);
        const data = await response.json();
        console.log('[DEBUG] Données JSON reçues:', data);
        setCountries(data.countries || []);
        console.log('[DEBUG] Countries loaded:', data.countries?.length || 0);
      } catch (error) {
        console.error('[DEBUG] Erreur lors du chargement des pays:', error);
        toast.error("Impossible de charger les données nécessaires");
      }
    };
    loadData();
  }, []);

  // Préremplissage du formulaire
  useEffect(() => {
    const loadProperty = async () => {
      console.log('[DEBUG] Starting loadProperty, propertyId:', propertyId);
      if (!propertyId) {
        console.log('[DEBUG] No propertyId, resetting form');
        reset({});
        return;
      }

      setLoadingForm(true);
      try {
        // Vérifier d'abord si l'enregistrement existe
        console.log('[DEBUG] Fetching property data...');
        const response = await fetch(`/api/property/${propertyId}`);
        console.log('[DEBUG] Response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 404) {
            console.log('[DEBUG] Property not found, resetting store');
            setPropertyId(null);
            reset({});
            toast.info("Aucune donnée trouvée, nouveau formulaire initialisé");
            return;
          }
          throw new Error('Erreur lors de la récupération des données');
        }

        const property = await response.json();
        console.log('[DEBUG] Property data loaded:', property);

        // Adapter les noms de champs si nécessaire
        const formData = {
          ...property,
          // Ajouter ici des transformations de noms de champs si nécessaire
        };

        reset(formData);
        console.log('[DEBUG] Form reset with data:', formData);
      } catch (error) {
        console.error('[DEBUG] Error in loadProperty:', error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoadingForm(false);
      }
    };

    loadProperty();
  }, [propertyId, reset, setLoadingForm]);

  // Soumission du formulaire
  const onSubmit = async (formData: OnboardingGeneralInfosStepFormFieldsType) => {
    console.log('[DEBUG] Form submitted with data:', formData);
    console.log('[DEBUG] Utilisateur courant (authUser):', authUser);
    console.log('[DEBUG] ID utilisateur envoyé pour created_by:', authUser?.id);
    setLoadingForm(true);
    try {
      let id = propertyId;
      let response, data;
      if (!id || typeof id !== 'string') {
        // INSERT
        console.log('[DEBUG] On va faire un POST pour créer la propriété');
        response = await fetch('/api/property', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, statut: 'draft', created_by: authUser?.id })
        });
        console.log('[DEBUG] Réponse POST:', response);
        data = await response.json();
        console.log('[DEBUG] Données JSON POST:', data);
        if (!response.ok || !data.id) {
          toast.error(data.error || "Erreur lors de la création du logement");
          setPropertyId(null); // Nettoie le store si erreur
          return;
        }
        id = data.id;
        console.log('[DEBUG] ID reçu après création:', id);
        setPropertyId(id);
      } else {
        // UPDATE
        if (typeof id !== 'string' || !id.match(/^([0-9a-fA-F-]){36,}$/)) {
          toast.error("ID de propriété invalide, réinitialisation du formulaire.");
          setPropertyId(null);
          reset({});
          return;
        }
        console.log('[DEBUG] Tentative de mise à jour de propriété (PUT)');
        response = await fetch(`/api/property/${id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            updated_at: new Date().toISOString()
          })
        });
        console.log('[DEBUG] Réponse PUT:', response);
        if (!response.ok) {
          const errorData = await response.json();
          console.error('[DEBUG] Erreur détaillée:', errorData);
          toast.error(errorData.error || "Erreur lors de la mise à jour du logement");
          return;
        }
        data = await response.json();
        console.log('[DEBUG] Données JSON PUT:', data);
      }
      toast.success("Logement sauvegardé");
      next();
    } catch (error) {
      console.error('[DEBUG] Erreur inattendue lors du submit:', error);
      toast.error("Une erreur est survenue lors de l'enregistrement");
      setPropertyId(null); // Nettoie le store en cas d'erreur inattendue
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div className="relative h-screen pb-[91px]">
      <div className="h-full overflow-auto">
        <Container className="grid h-full grid-cols-12">
          <div className="relative z-10 flex items-center h-full col-span-6 py-10">
            <div className="w-full space-y-5 pb-4.5">
             
              <Typography variant="h1" component="h1">
                Informations générales
              </Typography>
              <Typography variant="body-base" component="p" theme="gray">
                Fournissez les informations principales concernant votre logement. Ces détails
                permettent de mieux informer vos futurs locataires.
              </Typography>
            </div>
          </div>

          <div className="flex items-center h-full col-span-6">
            <div className="flex justify-end w-full">
              <GeneralInfoStepForm
                form={{
                  errors,
                  control,
                  register,
                  handleSubmit,
                  onSubmit,
                  isLoading: isLoadingForm,
                }}
                countries={countries}
              />
            </div>
          </div>
        </Container>
      </div>

      <OnboardingFooter
        prev={prev}
        next={handleSubmit(onSubmit)}
        isFirstStep={isFirstStep}
        isFinalStep={isFinalStep}
        isLoading={isLoading || isLoadingForm}
      />
    </div>
  );
};