import { BaseComponentProps } from "@/types/onboarding-steps-List";
import { OnboardingFooter } from "../../footer/onboarding-footer";
import { Container } from "@/ui/components/container/container";
import { Typography } from "@/ui/design-system/typography/typography";
import { OnboardingTabs } from "../../tabs/onboarding-tabs";
import { useForm, SubmitHandler } from "react-hook-form";
import { useToggle } from "@/hooks/use-toggle";
import { useAuth } from "@/Context/AuthUserContext";
import { usePreferences } from "@/hooks/use-preferences";
import { toast } from "react-toastify";
import { useEffect, useRef } from "react";

type StatutStepFormFields = {
  statut: string;
};

export const StatutStep = ({
  prev,
  next,
  isFirstStep,
  isFinalStep,
  stepsList,
  getCurrentStep,
}: BaseComponentProps) => {
  const { authUser, setAuthUser } = useAuth();
  const { value: isLoading, setvalue: setLoading } = useToggle();
  const { preferences, fetchPreferences, loading: preferencesLoading } = usePreferences();
  const hasFetched = useRef(false);
  
  const {
    handleSubmit,
    control,
    formState: { errors },
    register,
    setValue,
    watch
  } = useForm<StatutStepFormFields>({
    defaultValues: {
      statut: authUser?.userDocument?.statut || ""
    }
  });

  const statutValue = watch("statut");

  // Récupérer les préférences au chargement du composant (une seule fois)
  useEffect(() => {
    if (!hasFetched.current && !preferences?.status) {
      hasFetched.current = true;
      fetchPreferences();
    }
  }, [fetchPreferences, preferences?.status]);

  const onSubmit: SubmitHandler<StatutStepFormFields> = async (formData) => {
    if (!formData.statut) {
      toast.error("Merci de sélectionner un statut.");
      return;
    }
    try {
      setLoading(true);
      // Ici tu peux faire un appel API pour sauvegarder le statut
      setAuthUser({
        ...authUser,
        userDocument: {
          ...authUser.userDocument,
          statut: formData.statut
        }
      });
      localStorage.setItem('user', JSON.stringify({
        ...authUser,
        userDocument: {
          ...authUser.userDocument,
          statut: formData.statut
        }
      }));
      next();
      setLoading(false);
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde du statut");
      setLoading(false);
    }
  };

  // Icônes pour chaque statut
  const getStatutIcon = (label: string) => {
    const icons: { [key: string]: string } = {
      'student': '🎓',
      'professional': '🧑‍💼',
      'family': '👨‍👩‍👧‍👦',
      'others': '❓'
    };
    return icons[label] || '❓';
  };

  // Traduction des labels
  const getStatutLabel = (label: string) => {
    const labels: { [key: string]: string } = {
      'student': 'Étudiant',
      'professional': 'Professionnel',
      'family': 'Famille',
      'others': 'Autre'
    };
    return labels[label] || label;
  };

  if (preferencesLoading) {
    return (
      <div className="relative h-screen pb-[91px]">
        <div className="h-full overflow-auto">
          <Container className="grid h-full grid-cols-12">
            <div className="relative z-10 flex items-center h-full col-span-6 py-10">
              <div className="space-y-5 pb-4.5">
                <OnboardingTabs 
                  tabs={stepsList}
                  getCurrentStep={getCurrentStep}
                />
                <Typography variant="h1" component="h1">
                  Chargement des options...
                </Typography>
              </div>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen pb-[91px]">
      <div className="h-full overflow-auto">
        <Container className="grid h-full grid-cols-12">
          <div className="relative z-10 flex items-center h-full col-span-6 py-10">
            <div className=" space-y-5 pb-4.5">
              <OnboardingTabs 
                tabs={stepsList}
                getCurrentStep={getCurrentStep}
              />
              <Typography variant="h1" component="h1">
                Quel est votre statut ?
              </Typography>
              <Typography
                variant="body-base"
                component="p"
                theme="gray"
              >
                Cela nous aidera à vous recommander des logements adaptés à votre profil.
              </Typography>
             
            </div>
          </div>
          <div className="flex items-center h-full col-span-6">
            {/* Illustration ou image optionnelle */}
            <div className="flex justify-center w-full mb-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl">
                {preferences?.status?.map((statut) => (
                  <div
                    key={statut.id}
                    className={`cursor-pointer rounded border p-6 flex flex-col justify-center items-center text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg w-62 h-62
                      ${statutValue === statut.label
                        ? 'border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20'
                        : 'border-gray-400 bg-white hover:border-primary/50 hover:shadow-md'}
                    `}
                    onClick={() => setValue("statut", statut.label)}
                  >
                    <div className="mb-4 flex-shrink-0 text-4xl">{getStatutIcon(statut.label)}</div>
                    <Typography variant="h5" className="mb-2 font-semibold">
                      {getStatutLabel(statut.label)}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
            {errors.statut && (
              <Typography variant="body-sm" theme="danger">
                {errors.statut.message}
              </Typography>
            )}
          </div>
        </Container>
      </div>
      <OnboardingFooter
        prev={prev}
        next={handleSubmit(onSubmit)}
        isFirstStep={isFirstStep}
        isFinalStep={isFinalStep}
        isLoading={isLoading}
      />
    </div>
  );
}; 