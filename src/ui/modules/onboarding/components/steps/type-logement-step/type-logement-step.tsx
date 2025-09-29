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

type TypeLogementStepFormFields = {
  type: string;
};

export const TypeLogementStep = ({
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
  } = useForm<TypeLogementStepFormFields>({
    defaultValues: {
      type: authUser?.userDocument?.type_logement || ""
    }
  });

  const typeValue = watch("type");

  // Récupérer les préférences au chargement du composant (une seule fois)
  useEffect(() => {
    if (!hasFetched.current && !preferences?.property_type) {
      hasFetched.current = true;
      fetchPreferences();
    }
  }, [fetchPreferences, preferences?.property_type]);

  const onSubmit: SubmitHandler<TypeLogementStepFormFields> = async (formData) => {
    if (!formData.type) {
      toast.error("Merci de sélectionner un type de logement.");
      return;
    }
    try {
      setLoading(true);
      setAuthUser({
        ...authUser,
        userDocument: {
          ...authUser.userDocument,
          type_logement: formData.type
        }
      });
      localStorage.setItem('user', JSON.stringify({
        ...authUser,
        userDocument: {
          ...authUser.userDocument,
          type_logement: formData.type
        }
      }));
      next();
      setLoading(false);
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde du type de logement");
      setLoading(false);
    }
  };

  // Icônes pour chaque type de logement
  const getTypeIcon = (label: string) => {
    const icons: { [key: string]: string } = {
      'studio': '🛏️',
      'apartment': '🏢',
      'house': '🏡',
      'villa': '🏰'
    };
    return icons[label] || '🏠';
  };

  // Traduction des labels
  const getTypeLabel = (label: string) => {
    const labels: { [key: string]: string } = {
      'studio': 'Studio',
      'apartment': 'Appartement',
      'house': 'Maison',
      'villa': 'Villa'
    };
    return labels[label] || label;
  };

  if (preferencesLoading) {
    return (
      <div className="relative h-screen pb-[91px]">
        <div className="h-full overflow-auto">
          <Container className="grid h-full grid-cols-2 gap-12">
            <div className="flex flex-col justify-center items-center h-full">
              <div className="w-full space-y-5 pb-4.5">
                <OnboardingTabs 
                  tabs={stepsList}
                  getCurrentStep={getCurrentStep}
                />
                <Typography variant="h2" component="h1">
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
        <Container className="grid h-full grid-cols-2 gap-12">
          <div className="flex flex-col justify-center items-center h-full">
            <div className="w-full space-y-5 pb-4.5">
              <OnboardingTabs 
                tabs={stepsList}
                getCurrentStep={getCurrentStep}
              />
              <Typography variant="h2" component="h1">
                Quel type de logement préférez-vous ?
              </Typography>
              <Typography
                variant="body-base"
                component="p"
              >
                Sélectionnez le type de logement qui vous correspond le mieux.
              </Typography>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center h-full">
            <div className="grid grid-cols-2 gap-4 mt-6">
              {preferences?.property_type?.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className={`flex flex-col items-center justify-center p-6 rounded border transition-all text-lg font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 h-32
                    ${typeValue === type.label ? "bg-primary/5 text-gray border-primary-200 scale-105" : "bg-white text-gray-800 border-gray-300 hover:border-primary-200"}`}
                  onClick={() => setValue("type", type.label)}
                >
                  <span className="text-3xl mb-2">{getTypeIcon(type.label)}</span>
                  {getTypeLabel(type.label)}
                </button>
              ))}
            </div>
            {errors.type && (
              <Typography variant="body-sm" theme="danger">
                {errors.type.message}
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