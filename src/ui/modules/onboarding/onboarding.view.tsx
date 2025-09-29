import { BaseComponentProps } from "@/types/onboarding-steps-List";


export const OnboardingView = ({
  getCurrentStep,
  next,
  prev,
  isFirstStep,
  isFinalStep,
  stepsList,
}: BaseComponentProps) => {
    console.log('::', getCurrentStep)
  if (getCurrentStep()?.component) {
    const Component = getCurrentStep()?.component.step;
    
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
  
  return null;
};