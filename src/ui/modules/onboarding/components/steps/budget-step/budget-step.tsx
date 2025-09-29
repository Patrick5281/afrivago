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
import Image from "next/image";

const BUDGET_MIN = 10000;
const BUDGET_MAX = 1000000;
const BUDGET_STEP = 5000;

type BudgetStepFormFields = {
  budgetMin: number;
  budgetMax: number;
};

export const BudgetStep = ({
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
  } = useForm<BudgetStepFormFields>({
    defaultValues: {
      budgetMin: authUser?.userDocument?.budget_min || BUDGET_MIN,
      budgetMax: authUser?.userDocument?.budget_max || BUDGET_MIN * 2
    }
  });
  const [min, setMin] = useState(authUser?.userDocument?.budget_min || BUDGET_MIN);
  const [max, setMax] = useState(authUser?.userDocument?.budget_max || BUDGET_MIN * 2);

  // Récupérer les préférences au chargement du composant (une seule fois)
  useEffect(() => {
    if (!hasFetched.current && !preferences?.budget) {
      hasFetched.current = true;
      fetchPreferences();
    }
  }, [fetchPreferences, preferences?.budget]);

  const onSubmit: SubmitHandler<BudgetStepFormFields> = async (formData) => {
    if (formData.budgetMin < BUDGET_MIN || formData.budgetMax > BUDGET_MAX || formData.budgetMin >= formData.budgetMax) {
      toast.error("Merci de choisir une fourchette de budget valide.");
      return;
    }
    try {
      setLoading(true);
      if (authUser) {
        setAuthUser({
          ...authUser,
          userDocument: {
            ...authUser.userDocument,
            budget_min: formData.budgetMin,
            budget_max: formData.budgetMax
          }
        });
        localStorage.setItem('user', JSON.stringify({
          ...authUser,
          userDocument: {
            ...authUser.userDocument,
            budget_min: formData.budgetMin,
            budget_max: formData.budgetMax
          }
        }));
      }
      next();
      setLoading(false);
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde du budget");
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
                Quel est votre budget mensuel ?
              </Typography>
              <Typography
                variant="body-base"
                component="p"
              >
                Indiquez une fourchette de budget pour mieux cibler les recommandations.
              </Typography>

              <div className="flex flex-col gap-4 mt-6">
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={BUDGET_MIN}
                    max={max - BUDGET_STEP}
                    step={BUDGET_STEP}
                    value={min}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setMin(v);
                      setValue("budgetMin", v);
                    }}
                    className="w-full"
                  /> 
                    <div className="flex items-center space-x-2">
                      <Typography variant="body-base">
                         {min.toLocaleString()} 
                        <Typography variant="body-base">
                          FCFA
                        </Typography>
                      </Typography> 
                    </div>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={min + BUDGET_STEP}
                    max={BUDGET_MAX}
                    step={BUDGET_STEP}
                    value={max}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setMax(v);
                      setValue("budgetMax", v);
                    }}
                    className="w-full"
                  />
                  <div className="flex items-center space-x-2">
                      <Typography variant="body-base">
                         {max.toLocaleString()} 
                        <Typography variant="body-base">
                          FCFA
                        </Typography>
                      </Typography> 
                    </div>
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Typography variant="body-base">
                  <span>Min : {BUDGET_MIN.toLocaleString()} FCFA</span>
                  </Typography>
                   <Typography variant="body-base">
                  <span>Max : {BUDGET_MAX.toLocaleString()} FCFA</span>
                  </Typography>
                </div>
              </div>
              {errors.budgetMin && (
                <Typography variant="body-sm" theme="danger">
                  {errors.budgetMin.message}
                </Typography>
              )}
              {errors.budgetMax && (
                <Typography variant="body-sm" theme="danger">
                  {errors.budgetMax.message}
                </Typography>
              )}
              
            </div>
          </div>
          <div className="flex flex-col justify-center items-center h-full">
            <Image
              src="/assets/svg/pig.svg"
              alt="Illustration tirelire"
              width={350}
              height={350}
              className="drop-shadow-lg"
            />
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