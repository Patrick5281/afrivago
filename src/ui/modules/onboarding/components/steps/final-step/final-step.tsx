import { useAuth } from "@/Context/AuthUserContext"; 
import { useToggle } from "@/hooks/use-toggle";
import { useOnboardingPreferences } from "@/hooks/use-onboarding-preferences";
import { BaseComponentProps } from "@/types/onboarding-steps-List"; 
import { OnboardingFooter } from "../../footer/onboarding-footer";
import { Container } from "@/ui/components/container/container";
import { Typography } from "@/ui/design-system/typography/typography";
import { Logo } from "@/ui/design-system/logo/logo";
import { useCallback, useEffect } from "react";
import confetti from 'canvas-confetti';
import { toast } from "react-toastify";

export const FinalStep = ({ isFinalStep }: BaseComponentProps) => {
  const { authUser, setAuthUser } = useAuth();
  const { value: isLoading, toggle } = useToggle();
  const { saveOnboardingPreferences, loading: savingPreferences } = useOnboardingPreferences();
 
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
    toggle();
    try {
      if (!authUser?.id) {
        toast.error("id utilisateur requis");
        toggle();
        return;
      }

      // Sauvegarder les préférences de l'onboarding
      const preferencesSaved = await saveOnboardingPreferences();
      if (!preferencesSaved) {
        toast.error("Erreur lors de la sauvegarde des préférences");
        toggle();
        return;
      }

      // Mettre à jour le statut d'onboarding
      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: authUser.id,
          onboardingiscompleted: true 
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Erreur lors de la finalisation de l'onboarding");
        toggle();
        return;
      }
      
      const updatedUser = await response.json();
      
      // Mets à jour le contexte et le localStorage
      setAuthUser({
        ...authUser,
        userDocument: {
          ...authUser.userDocument,
          onboardingiscompleted: true,
        },
      });
      
      localStorage.setItem('user', JSON.stringify({
        ...authUser,
        userDocument: {
          ...authUser.userDocument,
          onboardingiscompleted: true,
        },
      }));
      
      toast.success("Onboarding terminé avec succès ! Vos préférences ont été sauvegardées.");
      toggle();
    } catch (error) {
      toast.error("Erreur lors de la finalisation de l'onboarding");
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
                     Félicitation!            
                  </Typography>
                  <Typography
                    variant="body-base"
                    component="p"
                    theme="gray"
                    className="text-center"
                  >
                    Votre profil a été configuré avec succès ! 
                    Nous utiliserons vos préférences pour vous proposer 
                    des logements adaptés à vos besoins.
                  </Typography>
              </div>
                </div>
            </Container>
          </div>
          <OnboardingFooter
           next={handleCloseOnboarding}
            isFinalStep={isFinalStep}
            isLoading={isLoading || savingPreferences}
          />
        </div>
  );
};