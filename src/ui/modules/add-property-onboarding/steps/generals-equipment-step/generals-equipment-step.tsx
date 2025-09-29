import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import { OnboardingFooter } from '../../components/footer/onboarding-footer';
import { OnboardingTabs } from '../../components/tabs/onboarding-tabs';
import { Container } from '@/ui/components/container/container';
import { Typography } from '@/ui/design-system/typography/typography';
import { useToggle } from '@/hooks/use-toggle';
import { usePropertyOnboardingStore } from '../../context/propertyOnboarding.store';
import { BaseComponentProps } from '@/types/onboarding-steps-List';
import { ScreenSpinner } from '@/ui/design-system/spinner/screen-spinner';

interface Term {
  id: number;
  label: string;
}

interface PropertyTermsForm {
  [key: string]: boolean;
}

export const GeneralEquipmentsConditionsStep = ({
  prev,
  next,
  isFirstStep,
  isFinalStep,
  stepsList,
  getCurrentStep,
}: BaseComponentProps) => {
  const propertyId = usePropertyOnboardingStore(state => state.propertyId);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(false);
  const { value: isLoadingForm, setvalue: setLoadingForm } = useToggle();
  const store = usePropertyOnboardingStore();

  const { register, handleSubmit, setValue, getValues, formState: { errors }, reset } = useForm<PropertyTermsForm>({});

  // Charger dynamiquement les terms et les property_terms
  useEffect(() => {
    const fetchTermsAndPropertyTerms = async () => {
      setLoading(true);
      try {
        console.log('[DEBUG] Chargement des terms pour propertyId:', propertyId);
        const res = await fetch(`/api/property/terms?propertyId=${propertyId}`);
        if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
        const data = await res.json();
        console.log('[DEBUG] Données reçues de l\'API:', data);
        setTerms(data.terms || []);

        // Préparation des valeurs à injecter dans le formulaire
        if (data.propertyTerms) {
          const defaultValues: Record<string, boolean> = {};
          data.terms.forEach((term: Term) => {
            const column = termLabelToColumn[term.label];
            if (column) {
              const value = Boolean(data.propertyTerms[column]);
              defaultValues[term.label + '_allowed'] = value;
              console.log(`[DEBUG] Mapping term '${term.label}' -> colonne '${column}' : valeur en base =`, data.propertyTerms[column], ', valeur booléenne =', value);
            } else {
              console.log(`[DEBUG] Aucun mapping trouvé pour le label '${term.label}'`);
            }
          });
          console.log('[DEBUG] Valeurs injectées dans reset :', defaultValues);
          reset(defaultValues); // <-- Utilise reset ici !
        } else {
          console.log('[DEBUG] Pas de propertyTerms pour cette propriété');
        }
      } catch (error) {
        console.error('[ERROR] Erreur lors du chargement des terms:', error);
        toast.error('Erreur lors du chargement des conditions');
        setTerms([]);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchTermsAndPropertyTerms();
    }
  }, [propertyId, reset]);

  // Synchronisation du propertyId avec le localStorage si absent
  useEffect(() => {
    if (!propertyId) {
      const storedId = localStorage.getItem('onboarding_property_id');
      if (storedId) {
        store.setPropertyId(storedId);
      }
    }
  }, [propertyId]);

  // Mapping label -> colonne property_terms
  const termLabelToColumn: Record<string, string> = {
    "Animaux autorisés": "animals_allowed",
    "Fêtes autorisées": "parties_allowed",
    "Fumer autorisé": "smoking_allowed",
    "Sous-location autorisée": "subletting_allowed"
  };

  const onSubmit: SubmitHandler<PropertyTermsForm> = async (formData) => {
    if (!propertyId) {
      toast.error('ID de propriété manquant');
      return;
    }
    setLoadingForm(true);
    try {
      const payload: Record<string, any> = { property_id: propertyId, updated_at: new Date().toISOString() };
      terms.forEach(term => {
        const column = termLabelToColumn[term.label];
        if (column) {
          payload[column] = Boolean(formData[term.label + '_allowed']);
        }
      });
      const response = await fetch('/api/property/terms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, payload })
      });
      const resData = await response.json();
      console.log('[DEBUG] Réponse API PATCH /property/terms:', resData);
      toast.success('Conditions enregistrées avec succès');
      store.next();
      setTimeout(() => {
        if (store.currentStep === 7) {
          store.setCurrentStep(8);
        }
      }, 100);
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement des conditions");
    } finally {
      setLoadingForm(false);
    }
  };

  // Fonction pour gérer la navigation suivante
  const handleNext = () => {
    handleSubmit(onSubmit)();
  };

  if (loading) {
    return (
      <ScreenSpinner />
    );
  }

  return (
    <div className="relative h-screen pb-[91px]">
      <div className="h-full overflow-auto">
        <Container>
          {/* Layout centré avec flexbox */}
          <div className="min-h-full flex items-center justify-center py-20">
            <div className="w-full max-w-4xl mx-auto">
              {/* Grid responsive pour organiser le contenu */}
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-12 items-center">
                
                {/* Section gauche - Titre et description */}
                <div className="text-center lg:text-center">
                  <div className="space-y-4">
                    <Typography variant="h3">
                      Conditions générales
                    </Typography>
                    <Typography variant="body-base">
                      Cochez les conditions applicables à votre bien.
                    </Typography>
                  </div>
                </div>

                {/* Section droite - Formulaire */}
                <div className="w-full">
                  <div className="space-y-8">
                    {/* Liste des conditions */}
                    <div className="space-y-6">
                      {terms.length > 0 ? terms.map(term => (
                        <div key={term.id} className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            id={term.label + '_allowed'}
                            {...register(term.label + '_allowed')}
                            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 focus:ring-2"
                          />
                          <label 
                            htmlFor={term.label + '_allowed'} 
                            className="text-base font-medium text-gray-700 cursor-pointer select-none"
                          >
                            {term.label}
                          </label>
                        </div>
                      )) : (
                        <div className="text-center py-8">
                          <Typography variant="body-base" theme="gray">
                            Aucune condition disponible
                          </Typography>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
      
      {/* Footer avec les boutons - Déplacé en dehors du Container */}
      <OnboardingFooter
        prev={prev}
        next={handleNext}
        isFirstStep={isFirstStep}
        isFinalStep={isFinalStep}
        isLoading={isLoadingForm}
      />
    </div>
  );
};