import { useToggle } from "@/hooks/use-toggle";
import { BaseComponentProps } from "@/types/onboarding-steps-List"; 
import { OnboardingFooter } from "../../components/footer/onboarding-footer";
import { Container } from "@/ui/components/container/container";
import { Typography } from "@/ui/design-system/typography/typography";
import { Logo } from "@/ui/design-system/logo/logo";
import { useCallback, useEffect } from "react";
import confetti from 'canvas-confetti';
import { toast } from "react-toastify";
import { usePropertyOnboardingStore } from '../../context/propertyOnboarding.store';
import { usePropertyOnboarding } from "@/Context/PropertyOnboardingContext";
import { useRouter } from 'next/router';

export const FinalStep = ({ isFinalStep }: BaseComponentProps) => {
  const router = useRouter();
  const { value: isLoading, toggle } = useToggle();
  const resetOnboarding = usePropertyOnboardingStore(state => state.resetOnboarding);
  const propertyId = usePropertyOnboardingStore(state => state.propertyId);
  const { resetContext } = usePropertyOnboarding();
 
  const fire = useCallback(() => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55
    });

    fire(0.2, {
      spread: 60
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
      
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
      
    fire(0.1, {
      spread: 120,
      startVelocity: 45
    });
  }, []);

  useEffect(() => {
    setTimeout(() => {
      fire()
    }, 50)
  }, [fire]);

  const handleCloseOnboarding = async () => {
    if (!propertyId) {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
      return;
    }

    toggle();
    try {
      const response = await fetch('/api/property/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la publication');
      }

      toast.success('Votre bien a été publié avec succès ! 🎉');
      resetOnboarding();
      resetContext();
      
      // Rediriger vers la page des biens après un court délai
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error: any) {
      console.error('[ERROR] Erreur lors de la publication:', error);
      toast.error('Une erreur est survenue lors de la publication. Veuillez réessayer.');
      toggle();
    }
  };

  return (
    <div className="relative h-screen pb-[91px]">
      <div className="h-full overflow-auto">
        <Container className="h-full">
          <div className="relative z-10 flex items-center h-full py-10">
            <div className="w-full max-w-xl mx-auto space-y-5 pb-4">
              <div className="flex justify-center">
                <Logo size="large" />
              </div>
              <Typography variant="h1" component="h1" className="text-center">
                Félicitations ! 🎉
              </Typography>
              <Typography
                variant="body-base"
                component="p"
                theme="gray"
                className="text-center"
              >
                Votre bien est prêt à être publié ! Une fois publié, il sera visible par tous les utilisateurs 
                de la plateforme. Vous pourrez toujours le modifier ou le désactiver depuis votre espace personnel.
              </Typography>
            </div>
          </div>
        </Container>
      </div>
      <OnboardingFooter
        next={handleCloseOnboarding}
        isFinalStep={isFinalStep}
        isLoading={isLoading}
      />
    </div>
  );
};