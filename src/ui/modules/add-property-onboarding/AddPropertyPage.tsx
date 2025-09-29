import { useState } from 'react';
import Image from "next/image";
import { Container } from '@/ui/components/container/container';
import { Typography } from '@/ui/design-system/typography/typography';
import { Button } from '@/ui/design-system/button/button';
import { AddPropertyOnboardingContainer } from './addPropertyOnboarding.container';
import { PropertyOnboardingProvider } from "@/Context/PropertyOnboardingContext";

export const AddPropertyPage = () => {
  const [hasStarted, setHasStarted] = useState(false);

  const handleStart = () => {
    setHasStarted(true);
  };

  // Si l'onboarding a commencé, afficher le container d'onboarding
  if (hasStarted) {
    return (
      <PropertyOnboardingProvider>
        <AddPropertyOnboardingContainer />
      </PropertyOnboardingProvider>
    );
  }

  // Sinon, afficher la page d'accueil
  return (
    <Container className="flex flex-col md:flex-row min-h-[80vh] rounded-lg items-center justify-center">
      {/* Wrapper pour centrer verticalement et horizontalement */}
      <div className="flex flex-1 items-center justify-center h-full">
        <Image
          src="assets/svg/add1.svg"
          alt="Illustration ajout de bâtiment"
          width={320}
          height={320}
          className="object-contain rounded-lg shadow-md"
        />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 max-w-md text-center">
        <Typography variant="body-lg" className="text-2xl font-bold text-gray-900">
          Ajoutez votre bâtiment
        </Typography>
        <Typography variant="body-base" className="text-gray">
          Commencez à générer des revenus en ajoutant votre bâtiment sur Afrivago.
          <span className="font-semibold text-primary"> 4 étapes simples</span> pour publier votre bien et toucher vos premiers locataires !
        </Typography>
        <Button
          action={handleStart}
        >
          Commencer
        </Button>
      </div>
    </Container>
  );
};