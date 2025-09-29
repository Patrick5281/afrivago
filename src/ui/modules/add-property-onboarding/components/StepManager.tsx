import { useEffect } from 'react';
import { WelcomeStep } from '../steps/welcome-step/welcome-step';
import { GeneralInfoStep } from '../steps/general-info-step/general-infos-step';
import { PropertyTypeStep } from '../steps/property-type-step/property-type-step';
import { StudioConfigurationStep } from '../steps/studio-configuration-step/studio-configuration-step';
import { RentalChoiceStep } from '../steps/Rental choice/rental-choice';
import { EntirePropertyStep } from '../steps/entire-property-step/entire-property-step';
import { FinalStep } from '../steps/final-step/final-step';
import { usePropertyOnboardingStore } from '../context/propertyOnboarding.store';
import { GeneralEquipmentsConditionsStep } from '../steps/generals-equipment-step/generals-equipment-step';
import { NonHabitableRoomsStep } from '../steps/non-habitable-rooms-step/non-habitable-rooms-step';
import { PhotoStep } from '../steps/photo-step/photo-step';
import { VideoStep } from '../steps/video-step/video-step';
import { PricingStep } from '../steps/pricing-step/pricing-step';
import { PolicyAndConditionsStep } from '../steps/policy-and-general-conditions/policy-and-general-conditions';
import RentalUnitMiniOnboardingContainer from '../steps/unit-property-step/RentalUnitMiniOnboardingContainer';
import RentalUnitConfigPage from '../steps/unit-property-step/RentalUnitConfigPage';
import { PropertyDescriptionStep } from '../steps/property-description-step/property-description-step';

export const StepManager = () => {
  const { setSteps } = usePropertyOnboardingStore();

  useEffect(() => {
    const steps = [
      { id: 1, label: 'Bienvenue', component: { step: WelcomeStep } },
      { id: 2, label: 'Informations Générales', component: { step: GeneralInfoStep } },
      { id: 3, label: 'Type de bien', component: { step: PropertyTypeStep } },
      { id: 4, label: 'Configuration Studio', component: { step: StudioConfigurationStep }, condition: (ctx: any) => ctx.propertyType === 'studio' },
      { id: 5, label: 'Choix Locative', component: { step: RentalChoiceStep }, condition: (ctx: any) => ctx.propertyType !== 'studio' },
      { id: 6, label: 'Configuration Logement Entier', component: { step: EntirePropertyStep }, condition: (ctx: any) => ctx.propertyType !== 'studio' && ctx.rentalType === 'entire' },
      { id: 7, label: 'Configuration Unités Locatives', component: { step: RentalUnitConfigPage }, condition: (ctx: any) => ctx.propertyType !== 'studio' && ctx.rentalType === 'unit' },
      { id: 8, label: 'Description du Logement', component: { step: PropertyDescriptionStep } },
      { id: 9, label: 'Équipements Généraux', component: { step: GeneralEquipmentsConditionsStep } },
      { id: 10, label: 'Pièces Non Habitables', component: { step: NonHabitableRoomsStep } },
      { id: 11, label: 'Photos', component: { step: PhotoStep } },
      { id: 12, label: 'Vidéos', component: { step: VideoStep } },
      { id: 13, label: 'Prix Mensuel', component: { step: PricingStep } },
      { id: 14, label: 'Politique et Conditions', component: { step: PolicyAndConditionsStep } },
      { id: 15, label: 'Félicitations', component: { step: FinalStep } }
    ];

    // Ajouter des logs pour le debug
    console.log('Steps configurés:', steps);
    setSteps(steps);
  }, [setSteps]);

  return null;
};