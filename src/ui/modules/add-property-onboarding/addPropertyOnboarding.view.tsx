import { BaseComponentProps } from "@/types/onboarding-steps-List";
import { useEffect } from "react";

export const AddPropertyOnboardingView = ({
  getCurrentStep,
  next,
  prev,
  isFirstStep,
  isFinalStep,
  stepsList,
}: BaseComponentProps) => {
  useEffect(() => {
    console.log('[OnboardingView] Rendu - getCurrentStep() =', getCurrentStep());
  }, [getCurrentStep]);

  const currentStep = getCurrentStep();
  console.log('[OnboardingView] Step courant:', currentStep);

  if (currentStep?.component) {
    const Component = currentStep.component.step;
    
    return (
      <div>
        {Component && (
          <Component
            getCurrentStep={getCurrentStep}
            next={next}
            prev={prev}
            isFirstStep={isFirstStep}
            isFinalStep={isFinalStep}
            stepsList={stepsList}
          />
        )}
      </div>
    );
  }
  
  console.log('[OnboardingView] Aucun composant trouvé pour le step courant');
  return null;
};