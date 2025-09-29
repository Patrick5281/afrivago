import { WelcomeStep } from "./steps/welcome-step/welcome-step";
import { GeneralInfoStep } from "./steps/general-info-step/general-infos-step";
import { StudioConfigurationStep } from "./steps/studio-configuration-step/studio-configuration-step";
import { RentalChoiceStep } from "./steps/Rental choice/rental-choice";
import { EntirePropertyStep } from "./steps/entire-property-step/entire-property-step";
import { FinalStep } from "./steps/final-step/final-step";
import { AddPropertyOnboardingView } from "./addPropertyOnboarding.view";
import { onboardingStepsListInterface } from "./type/add-property-onboarding";
import { useState, useEffect } from "react";
import { StepManager } from "./components/StepManager";
import { usePropertyOnboardingStore } from "./context/propertyOnboarding.store";
import { PropertyService } from "./services/property.service";
import { Step } from "./context/propertyOnboarding.store";

export const AddPropertyOnboardingContainer = () => {
  const {
    propertyId,
    propertyType,
    currentStep,
    steps,
    setPropertyId,
    setCurrentStep,
    setPropertyType,
    setRentalType,
    updateDraftData,
    next,
    prev,
    isHydrated
  } = usePropertyOnboardingStore();

  const [isReady, setIsReady] = useState(false);

  // Attendre l'hydratation du store
  useEffect(() => {
    if (isHydrated()) {
      setIsReady(true);
    } else {
      const checkHydration = setInterval(() => {
        if (isHydrated()) {
          setIsReady(true);
          clearInterval(checkHydration);
        }
      }, 100);

      // Timeout de sécurité
      const timeout = setTimeout(() => {
        console.warn('[Container] Timeout d\'hydratation');
        setIsReady(true);
        clearInterval(checkHydration);
      }, 3000);

      return () => {
        clearInterval(checkHydration);
        clearTimeout(timeout);
      };
    }
  }, [isHydrated]);

  const getCurrentStep = () => {
    return steps.find((el: Step) => el.id === currentStep);
  };

  const isFirstStep = () => steps.length > 0 && currentStep === steps[0]?.id;
  const isFinalStep = () => steps.length > 0 && currentStep === steps[steps.length - 1]?.id;

  // Initialiser la propriété si nécessaire
  useEffect(() => {
    if (!isReady) return; // Attendre l'hydratation

    const initializeProperty = async () => {
      if (propertyType && !propertyId) {
        try {
          console.log('[Container] Création d\'un brouillon de bien');
          const { data, error } = await PropertyService.createDraft();
          if (data?.id && !error) {
            setPropertyId(data.id);
            await PropertyService.updateDraft(data.id, { property_type_id: propertyType });
            console.log('[Container] Bien créé avec ID:', data.id);
          } else {
            console.error('[Container] Erreur création bien:', error);
          }
        } catch (e) {
          console.error('[Container] Exception création bien:', e);
        }
      }
    };

    initializeProperty();
  }, [propertyType, propertyId, setPropertyId, isReady]);

  // Affichage de loading pendant l'hydratation
  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-gray-600">Initialisation de l'onboarding...</div>
      </div>
    );
  }

  return (
    <>
      <StepManager />
    <AddPropertyOnboardingView
      getCurrentStep={getCurrentStep}
      next={next}
      prev={prev}
      isFirstStep={isFirstStep}
      isFinalStep={isFinalStep}
        stepsList={steps}
    />
    </>
  );
};