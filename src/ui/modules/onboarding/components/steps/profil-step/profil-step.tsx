import { BaseComponentProps } from "@/types/onboarding-steps-List";
import { OnboardingFooter } from "../../footer/onboarding-footer";
import { Container } from "@/ui/components/container/container";
import { Typography } from "@/ui/design-system/typography/typography";
import { OnboardingTabs } from "../../tabs/onboarding-tabs";
import { SubmitHandler, useForm } from "react-hook-form";
import { OnboardingProfilStepFormFieldsType } from "@/types/forms";
import { useToggle } from "@/hooks/use-toggle";
import { ProfileStepForm } from "./profil-step-form";
import { useAuth } from "@/Context/AuthUserContext";
import { toast } from "react-toastify";
import { useEffect } from "react";

export const ProfilStep = ({
  prev,
  next,
  isFirstStep,
  isFinalStep,
  stepsList,
  getCurrentStep,
}: BaseComponentProps) => {
    const { authUser, setAuthUser } = useAuth();
    const { value: isLoading, setvalue: setLoading } = useToggle();
    const {
        handleSubmit,
        control,
        formState: { errors, isDirty },
        register,
        reset,
        setValue,
        watch
    } = useForm<OnboardingProfilStepFormFieldsType>({
        defaultValues: {
            name: authUser?.userDocument?.name || '',
            surname: authUser?.userDocument?.surname || '',
        }
    });

    // Charger les vraies données du user depuis la BDD au montage
    useEffect(() => {
      if (!authUser?.id) return;
      fetch(`/api/profile/me?id=${authUser.id}`)
        .then(res => res.json())
        .then(userFromDb => {
          if (userFromDb && (userFromDb.name || userFromDb.surname)) {
            setAuthUser({
              ...authUser,
              userDocument: {
                ...authUser.userDocument,
                name: userFromDb.name,
                surname: userFromDb.surname,
              }
            });
            localStorage.setItem('user', JSON.stringify({
              ...authUser,
              userDocument: {
                ...authUser.userDocument,
                name: userFromDb.name,
                surname: userFromDb.surname,
              }
            }));
            // Réinitialise le formulaire avec les valeurs de la BDD
            reset({
              name: userFromDb.name || '',
              surname: userFromDb.surname || '',
            });
          }
        });
    }, [authUser?.id, setAuthUser, reset]);

    // Surveiller les changements dans authUser.userDocument
    useEffect(() => {
        if (!authUser?.userDocument) return;
        console.log("[ProfilStep] userId:", authUser.id);
        console.log("[ProfilStep] userDocument:", authUser.userDocument);
    }, [authUser?.userDocument, authUser?.id]);

    if (!authUser?.userDocument) {
        return null;
    }

    const onSubmit: SubmitHandler<OnboardingProfilStepFormFieldsType> = async (formData) => {
        try {
            setLoading(true);

            console.log("[ProfilStep] SUBMIT userId:", authUser.id);
            console.log("[ProfilStep] SUBMIT userDocument:", authUser.userDocument);
            console.log("[ProfilStep] SUBMIT formData:", formData);

            // Nouvelle logique : comparer explicitement les valeurs du formulaire avec celles du contexte
            const currentName = authUser?.userDocument?.name || '';
            const currentSurname = authUser?.userDocument?.surname || '';
            const isModified =
                formData.name.trim() !== currentName.trim() ||
                formData.surname.trim() !== currentSurname.trim();

            if (isModified) {
                console.log("[ProfilStep] Form is modified, sending update to API...");
                const response = await fetch('/api/profile/update', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: authUser.id, ...formData }),
                });
                console.log("[ProfilStep] API response status:", response.status);
                if (!response.ok) {
                    const error = await response.json();
                    console.error("[ProfilStep] API error:", error);
                    toast.error(error.error || "Erreur lors de la mise à jour");
                    setLoading(false);
                    return; // NE PAS PASSER AU STEP SUIVANT
                }
                const updatedUser = await response.json();
                console.log("[ProfilStep] API update success, updatedUser:", updatedUser);
                // Met à jour le contexte et le localStorage
                setAuthUser({ ...authUser, userDocument: {
                  ...authUser.userDocument,
                  ...formData,
                  name: updatedUser.name,
                  surname: updatedUser.surname,
                }});
                localStorage.setItem('user', JSON.stringify({
                  ...authUser,
                  userDocument: {
                    ...authUser.userDocument,
                    ...formData,
                    name: updatedUser.name,
                    surname: updatedUser.surname,
                  }
                }));
                reset(formData);
            }
            // Dans tous les cas, on passe au step suivant
            next();
            setLoading(false);
            return;

        } catch (error) {
            console.error("[ProfilStep] Exception:", error);
            toast.error("Une erreur est survenue lors de la mise à jour");
            setLoading(false);
        }
    };

    return (
        <div className="relative h-screen pb-[91px]">
            <div className="h-full overflow-auto">
                <Container className="grid h-full grid-cols-12">
                    <div className="relative z-10 flex items-center h-full col-span-6 py-10">
                        <div className="w-full space-y-5 pb-4.5">
                            <OnboardingTabs 
                                tabs={stepsList}
                                getCurrentStep={getCurrentStep}
                            />
                            <Typography variant="h1" component="h1">
                                Présentez-vous !             
                            </Typography>
                            <Typography
                                variant="body-base"
                                component="p"
                                theme="gray"
                            >
                                    Découvrez des logements uniques et confortables,
                                    accédez à des offres introuvables ailleurs
                                    et réservez en toute simplicité.
                                    Prêts à trouver le lieu idéal pour votre prochain séjour ?
                            </Typography>
                        </div>
                    </div>
                    <div className="flex items-center h-full col-span-6">
                        <div className="flex justify-end w-full">
                            <ProfileStepForm
                                form={{
                                    errors,
                                    control,
                                    register,
                                    handleSubmit,
                                    onSubmit,
                                    isLoading,
                                }}
                            />
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