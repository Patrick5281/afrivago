import { useState } from "react";
import { OnboardingView } from "./onboarding.view";
import { onboardingStepsListInterface } from "@/types/onboarding-steps-List";
import { WelcomeStep } from "./components/steps/welcome-step/welcome-step";
import { ProfilStep } from "./components/steps/profil-step/profil-step";
import { AvatarStep } from "./components/steps/avatar-step/avatar-step";
import { FinalStep } from "./components/steps/final-step/final-step";

export const OnboardingProContainer = () => {
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
   
    {
      id: 3,
      label: "Avatar",
      component: { step: AvatarStep },
    },  
    {
      id: 4,
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