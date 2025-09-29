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
import { useEffect, useState } from "react";

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
    const [existingTitreFoncier, setExistingTitreFoncier] = useState<string>('');
    
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
            telephone: '',
            type_piece_id: '',
            numero_piece: '',
            fichier_piece: [],
            titre_foncier: [],
        }
    });

    // Charger les vraies données du user depuis la BDD au montage
    useEffect(() => {
      if (!authUser?.id) return;
      console.log('[ProfilStep] Chargement des données utilisateur depuis la BDD...');
      fetch(`/api/profile/pro/me?id=${authUser.id}`)
        .then(res => res.json())
        .then(userFromDb => {
          console.log('[ProfilStep] Données reçues de l\'API:', userFromDb);
          if (userFromDb && (userFromDb.name || userFromDb.surname)) {
            // Mise à jour du contexte utilisateur
            setAuthUser({
              ...authUser,
              userDocument: {
                ...authUser.userDocument,
                name: userFromDb.name,
                surname: userFromDb.surname,
              }
            });
            
            // Mise à jour du localStorage
            localStorage.setItem('user', JSON.stringify({
              ...authUser,
              userDocument: {
                ...authUser.userDocument,
                name: userFromDb.name,
                surname: userFromDb.surname,
              }
            }));
            
            // Réinitialise le formulaire avec toutes les valeurs de la BDD
            reset({
              name: userFromDb.name || '',
              surname: userFromDb.surname || '',
              telephone: userFromDb.telephone || '',
              type_piece_id: userFromDb.type_piece_id || '',
              numero_piece: userFromDb.numero_piece || '',
              fichier_piece: [],
              titre_foncier: [],
            });
            
            // Stocke l'URL du fichier titre foncier existant
            setExistingTitreFoncier(userFromDb.titre_foncier || '');
            
            console.log('[ProfilStep] Formulaire réinitialisé avec les données:', {
              name: userFromDb.name,
              surname: userFromDb.surname,
              telephone: userFromDb.telephone,
              type_piece_id: userFromDb.type_piece_id,
              numero_piece: userFromDb.numero_piece,
              titre_foncier: userFromDb.titre_foncier
            });
          }
        })
        .catch(error => {
          console.error('[ProfilStep] Erreur lors du chargement des données:', error);
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
            const userId = authUser?.id;
            if (!userId) {
                toast.error("Utilisateur non authentifié");
                setLoading(false);
                return;
            }
            
            console.log('[ProfilStep] Soumission du formulaire:', formData);
            
            // Création du FormData pour multipart
            const data = new FormData();
            data.append('id', userId);
            data.append('name', formData.name);
            data.append('surname', formData.surname);
            data.append('type_piece_id', formData.type_piece_id);
            data.append('numero_piece', formData.numero_piece);
            
            // Fichier titre foncier (optionnel)
            if (formData.titre_foncier && formData.titre_foncier.length > 0) {
                data.append('titre_foncier', formData.titre_foncier[0]);
            }
            
            // Log détaillé du FormData
            console.log('FormData id:', data.get('id'));
            console.log('FormData name:', data.get('name'));
            console.log('FormData surname:', data.get('surname'));
            console.log('FormData type_piece_id:', data.get('type_piece_id'));
            console.log('FormData numero_piece:', data.get('numero_piece'));
            console.log('FormData titre_foncier:', data.get('titre_foncier'));
            
            // Envoi à l'API
            const response = await fetch('/api/profile/pro/update', {
                method: 'PATCH',
                body: data,
            });
            
            if (!response.ok) {
                const error = await response.json();
                console.error('[ProfilStep] Erreur API:', error);
                toast.error(error.error || "Erreur lors de la mise à jour");
                setLoading(false);
                return;
            }
            
            const updatedUser = await response.json();
            console.log('[ProfilStep] Réponse API:', updatedUser);
            
            // Met à jour le contexte et le localStorage avec toutes les données
            setAuthUser({ 
                ...authUser, 
                userDocument: {
                    ...authUser.userDocument,
                    name: updatedUser.name,
                    surname: updatedUser.surname,
                }
            });
            
            localStorage.setItem('user', JSON.stringify({
                ...authUser,
                userDocument: {
                    ...authUser.userDocument,
                    name: updatedUser.name,
                    surname: updatedUser.surname,
                }
            }));
            
            // Met à jour l'état du titre foncier existant
            if (updatedUser.titre_foncier) {
                setExistingTitreFoncier(updatedUser.titre_foncier);
            }
            
            reset(formData);
            toast.success("Profil mis à jour avec succès !");
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
                                Présente toi !             
                            </Typography>
                            <Typography
                                variant="body-base"
                                component="p"
                                theme="gray"
                            >
                                Viens trainer avec des développeurs aussi fous
                                que toi, montre tes projets persos et reçois des
                                feedbacks constructifs (ou fais-toi carrément
                                descendre). Prêt à créer des trucs incroyables ?
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
                                    setValue,
                                    watch,
                                }}
                                existingTitreFoncier={existingTitreFoncier}
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