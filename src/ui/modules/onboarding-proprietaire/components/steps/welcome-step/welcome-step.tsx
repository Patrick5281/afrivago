import { BaseComponentProps } from "@/types/onboarding-steps-List";
import { OnboardingFooter } from "../../footer/onboarding-footer";
import { OnboardingHeader } from "../../header/onboarding-header";
import Image from "next/image";
import { Container } from "@/ui/components/container/container";
import { Typography } from "@/ui/design-system/typography/typography";
import { OnboardingTabs } from "../../tabs/onboarding-tabs";

export const WelcomeStep = ({
  next,
  isFirstStep,
  isFinalStep,
  stepsList,
  getCurrentStep,
}: BaseComponentProps) => {
  return (
    <div className="relative h-screen pb-[91px]">
      {/* Ajout du header en haut */}
      <OnboardingHeader className="absolute top-0 left-0 w-full z-20" />
      
      <div className="h-full overflow-auto pt-16"> {/* Ajout d'un padding-top pour compenser l'espace pris par le header */}
        <Container className="grid h-full grid-cols-12">
          <div className="relative z-10 flex items-center h-full col-span-6 py-10">
            <div className="w-full space-y-5 pb-4.5">
              <OnboardingTabs
                tabs={stepsList}
                getCurrentStep={getCurrentStep}
              />
              <Typography variant="h1" component="h1">
                Bienvenue sur afrivago !
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
                src="/assets/svg/rocket.svg"
                alt="Illustration rocket ..."
                width={811}
                height={596}
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