import { useState } from "react";
import { OnboardingView } from "./onboarding.view";
import { onboardingStepsListInterface } from "@/types/onboarding-steps-List";
import { WelcomeStep } from "./components/steps/welcome-step/welcome-step";
import { ProfilStep } from "./components/steps/profil-step/profil-step";
import { AvatarStep } from "./components/steps/avatar-step/avatar-step";
import { FinalStep } from "./components/steps/final-step/final-step";
import { StatutStep } from "./components/steps/statut-step/statut-step";
import { ZoneStep } from "./components/steps/zone-step/zone-step";
import { TypeLogementStep } from "./components/steps/type-logement-step/type-logement-step";
import { BudgetStep } from "./components/steps/budget-step/budget-step";

export const OnboardingContainer = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  console.log("currentStep", currentStep )
  const stepsList:onboardingStepsListInterface[] = [
    {
      id: 1,
      label: "Bienvenue",
      component: { step: WelcomeStep },
    },
    {
      id: 2,
      label: "Profile",
      component: { step: ProfilStep },
    },
    // Ajout des nouveaux steps recommandation
    {
      id: 3,
      label: "Statut",
      component: { step: StatutStep },
    },
    {
      id: 4,
      label: "Zone",
      component: { step: ZoneStep },
    },
    {
      id: 5,
      label: "Type logement",
      component: { step: TypeLogementStep },
    },
    {
      id: 6,
      label: "Budget",
      component: { step: BudgetStep },
    },
    {
      id: 7,
      label: "Avatar",
      component: { step: AvatarStep },
    },  
    {
      id: 8,
      label: "Dernière etape",
      component: { step: FinalStep },
    },
  ];

  console.log(stepsList.length);

  const getCurrentStep = () => {
    return stepsList.find((el) => el.id === currentStep);
  };

  const next = () => {
    if (currentStep < stepsList.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isFirstStep = () => {
    if (currentStep === 1) {
      return true;
    }
    return false;
  };
  
  const isFinalStep = () => {
    if (currentStep === stepsList.length) {
      return true;
    }
    return false;
  };

  
return ( // Ajoutez la parenthèse ouvrante ici
    <OnboardingView
      getCurrentStep={getCurrentStep}
      next={next}
      prev={prev}
      isFirstStep={isFirstStep}
      isFinalStep={isFinalStep}
      stepsList={stepsList}
    />
  );
};