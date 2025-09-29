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
import { useState, useEffect, useRef } from "react";
import { Input } from "@/ui/design-system/forms/input";

type ZoneStepFormFields = {
  zone: string;
};

export const ZoneStep = ({
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
  } = useForm<ZoneStepFormFields>({
    defaultValues: {
      zone: authUser?.userDocument?.zone || ""
    }
  });
  const [inputValue, setInputValue] = useState(authUser?.userDocument?.zone || "");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Récupérer les préférences au chargement du composant (une seule fois)
  useEffect(() => {
    if (!hasFetched.current && !preferences?.zone) {
      hasFetched.current = true;
      fetchPreferences();
    }
  }, [fetchPreferences, preferences?.zone]);

  // Filtrer les suggestions basées sur l'input
  const filteredSuggestions = preferences?.zone?.filter(zone =>
    zone.label.toLowerCase().includes(inputValue.toLowerCase()) && 
    zone.label.toLowerCase() !== inputValue.toLowerCase()
  ) || [];

  const onSubmit: SubmitHandler<ZoneStepFormFields> = async (formData) => {
    if (!formData.zone) {
      toast.error("Merci d'indiquer une zone ou un lieu préféré.");
      return;
    }
    try {
      setLoading(true);
      setAuthUser({
        ...authUser,
        userDocument: {
          ...authUser.userDocument,
          zone: formData.zone
        }
      });
      localStorage.setItem('user', JSON.stringify({
        ...authUser,
        userDocument: {
          ...authUser.userDocument,
          zone: formData.zone
        }
      }));
      next();
      setLoading(false);
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde de la zone");
      setLoading(false);
    }
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
                Où souhaitez-vous loger ?
              </Typography>
              <Typography
                variant="body-base"
                component="p"
                theme="gray"
              >
                Ville, quartier ou université préférée
              </Typography>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center h-full">
            <div className="relative w-full max-w-md">
              <Input
                type="text"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg shadow-sm"
                placeholder="Ex : Cotonou, Ganhi, ..."
                {...register("zone", { required: "Ce champ est requis" })}
                value={inputValue}
                onChange={e => {
                  setInputValue(e.target.value);
                  setValue("zone", e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                autoComplete="off"
              />
              {showSuggestions && inputValue.length > 0 && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 z-20 bg-white border border-primary-100 rounded-b-lg shadow-lg max-h-56 overflow-auto">
                  {filteredSuggestions.map(zone => (
                    <div
                      key={zone.id}
                      className="px-4 py-2 cursor-pointer hover:bg-primary-50 hover:text-primary-700 transition-colors"
                      onClick={() => {
                        setInputValue(zone.label);
                        setValue("zone", zone.label);
                        setShowSuggestions(false);
                      }}
                    >
                      {zone.label}
                    </div>
                  ))}
                </div>
              )}
              {errors.zone && (
                <Typography variant="body-sm" theme="danger">
                  {errors.zone.message}
                </Typography>
              )}
            </div>
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