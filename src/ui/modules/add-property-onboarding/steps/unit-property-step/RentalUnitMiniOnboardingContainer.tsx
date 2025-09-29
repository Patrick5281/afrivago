import { useState } from 'react';
import Step1Form from './Step1Form';
import Step2Rooms from './Step2Rooms';
import Step3Pricing from './Step3Pricing';
import { usePropertyOnboardingStore } from '../../context/propertyOnboarding.store';
import { Typography } from '@/ui/design-system/typography/typography';

const steps = [
  { id: 1, label: 'Informations de base', component: Step1Form },
  { id: 2, label: 'Ajouter les pièces', component: Step2Rooms },
  { id: 3, label: 'Définir le prix', component: Step3Pricing },
];

export default function RentalUnitMiniOnboardingContainer({ propertyId: propPropertyId, unitId: initialUnitId, onFinish }: { propertyId?: string, unitId?: string, onFinish?: () => void }) {
  const store = usePropertyOnboardingStore();
  // Priorité à la prop, sinon récupération depuis le store Zustand
  const propertyId = propPropertyId || store.propertyId;
  const [currentStep, setCurrentStep] = useState(1);
  const [unitId, setUnitId] = useState(initialUnitId || null);

  const goNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(s => s + 1);
    } else if (onFinish) {
      onFinish();
    }
  };
  const goPrev = () => setCurrentStep(s => Math.max(s - 1, 1));

  const StepComponent = steps.find(s => s.id === currentStep)?.component;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-6 flex items-center gap-4">
        {steps.map((step, idx) => (
          <Typography variant='body-base' key={step.id} className={`flex-1 text-center ${currentStep === step.id ? 'font-bold text-primary' : ''}`}>{step.label}</Typography>
        ))}
      </div>
      {StepComponent && (
        <StepComponent
          propertyId={propertyId}
          unitId={unitId}
          setUnitId={setUnitId}
          goNext={goNext}
          goPrev={goPrev}
          currentStep={currentStep}
          totalSteps={steps.length}
          store={store}
          onFinish={onFinish}
        />
      )}
    </div>
  );
} 