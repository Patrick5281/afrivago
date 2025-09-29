export interface BaseComponentProps {
    next: () => void;
    prev: () => void;
    isFirstStep: () => boolean;
    isFinalStep: () => boolean;
    stepsList: onboardingStepsListInterface[];
    getCurrentStep: () => onboardingStepsListInterface | undefined;
    handleStepSubmit?: (data: any, extraContext?: any) => Promise<void>;
    isLoading?: boolean;
  }
  
  export interface onboardingStepsListInterface {
    id: number;
    label: string;
    component: {
      step: React.ComponentType<BaseComponentProps>;
    };
    condition?: (context: any) => boolean;
  }