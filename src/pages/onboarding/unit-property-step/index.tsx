import { useRouter } from 'next/router';
import RentalUnitConfigPage from '@/ui/modules/add-property-onboarding/steps/unit-property-step/RentalUnitConfigPage';
 
export default function UnitPropertyStepPage() {
  const router = useRouter();
  // Navigation d'exemple : à adapter selon ta logique réelle
  const handlePrev = () => router.back();
  const handleNext = () => {};
  const isFirstStep = () => false;
  const isFinalStep = () => false;

  return (
    <RentalUnitConfigPage
      prev={handlePrev}
      next={handleNext}
      isFirstStep={isFirstStep}
      isFinalStep={isFinalStep}
    />
  );
} 