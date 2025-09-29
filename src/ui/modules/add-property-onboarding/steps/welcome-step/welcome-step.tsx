import { BaseComponentProps } from "@/types/onboarding-steps-List";
import Image from "next/image";
import { Container } from "@/ui/components/container/container";
import { Typography } from "@/ui/design-system/typography/typography";
import { OnboardingTabs } from "../../components/tabs/onboarding-tabs";
import { OnboardingFooter } from "../../components/footer/onboarding-footer";
import { Button } from "@/ui/design-system/button/button"; 


export const WelcomeStep = ({
  next,
  handleStepSubmit,
  isLoading,
  isFirstStep,
  isFinalStep,
  stepsList,
  getCurrentStep,
}: BaseComponentProps) => {
  const onSubmit = () => {
    if (handleStepSubmit) {
      handleStepSubmit({});
    } else {
      next();
    }
  };

  return (
    <div className="h-screen pb-[91px]">
      <div className="h-full overflow-auto pt-0"> {/* Ajout d'un padding-top pour compenser l'espace pris par le header */}
        <Container className="grid h-full grid-cols-12 space-x-24">
          <div className="relative z-10 flex items-center h-full col-span-6 py-10">
            <div className="w-full space-y-5 pb-4.5">
              
              <Typography variant="h1" component="h1">
                Ajoutez un Batiment !
              </Typography>
              <Typography
                variant="body-base"
                component="p"
                theme="gray"
              >
                Trouvez votre logement idéal en quelques clics !
                Dites-nous un peu plus sur vos préférences pour
                vous proposer les meilleures options. Prêt à
                trouver votre prochain sejour ? C'est parti !
              </Typography>
            </div>
          </div>
          <div className="flex items-center h-full col-span-6">
            <div className="w-full">
              <Image
                src="/assets/images/Batiment1.jpg"
                alt="Illustration rocket ..."
                width={322}
                height={344}
              />
            </div>
          </div>
        </Container>
      </div>
      <OnboardingFooter
        next={next}
        isFirstStep={isFirstStep}
        isFinalStep={isFinalStep}
      />
    </div>
  );
};