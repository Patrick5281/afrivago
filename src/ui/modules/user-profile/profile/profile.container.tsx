import { useAuth } from "@/Context/AuthUserContext";
import { useToggle } from "@/hooks/use-toggle";
import { UserProfilStepFormFieldsType } from "@/types/forms";
import { SubmitHandler, useForm } from "react-hook-form";
import { ProfileView } from "./profile.view";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { usePreferences } from "@/hooks/use-preferences";

export const ProfileContainer = () => {
    const { authUser, setAuthUser } = useAuth();
    const { value: isLoading, setvalue: setLoading } = useToggle();
    const { preferences, fetchPreferences, loading: preferencesLoading } = usePreferences();
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const preferencesFetchedRef = useRef(false);
    const {
      handleSubmit,
      control,
      formState: { errors, isDirty },
      register,
      setValue,
      reset,
      watch
    } = useForm<UserProfilStepFormFieldsType>();

    // LOG: authUser et authUserIsLoading
    console.log('[ProfileContainer] authUser:', authUser);

    // Récupérer les préférences au chargement (une seule fois)
    useEffect(() => {
      if (!preferencesFetchedRef.current && !preferences && !preferencesLoading) {
        preferencesFetchedRef.current = true;
        fetchPreferences();
      }
    }, []); // Pas de dépendance pour éviter les appels multiples

    useEffect(() => {
    if (authUser && authUser.userDocument) {
            console.log('[ProfileContainer] useEffect: reset form with', authUser.userDocument);
            reset({
                name: authUser.userDocument.name,
                surname: authUser.userDocument.surname,
            });
            if (authUser.userDocument.photourl) {
                setImagePreview(`${authUser.userDocument.photourl}?t=${new Date().getTime()}`);
      }
    }
    }, [authUser, reset]);

    // Pré-remplir les préférences quand elles sont disponibles
    useEffect(() => {
      if (authUser?.userDocument && preferences && !preferencesLoading) {
        console.log('[ProfileContainer][DEBUG] Pré-remplissage des préférences:', authUser.userDocument);
        console.log('[DEBUG] Pré-remplissage - statut :', authUser.userDocument.statut);
        console.log('[DEBUG] Pré-remplissage - type_logement :', authUser.userDocument.type_logement);
        console.log('[DEBUG] Pré-remplissage - zone :', authUser.userDocument.zone);
        console.log('[DEBUG] Pré-remplissage - budget_min/max :', authUser.userDocument.budget_min, authUser.userDocument.budget_max);
        // Pré-remplir le statut (champ unique)
        if (authUser.userDocument.statut) {
          setValue('statut', authUser.userDocument.statut);
        }
        // Pré-remplir le type de logement (champ unique)
        if (authUser.userDocument.type_logement) {
          setValue('type_logement', authUser.userDocument.type_logement);
        }
        // Pré-remplir les selects
        if (authUser.userDocument.zone) {
          setValue('zone', authUser.userDocument.zone);
        }
        // Pré-remplir le budget
        if (authUser.userDocument.budget_min && authUser.userDocument.budget_max) {
          const budgetRange = `${authUser.userDocument.budget_min}-${authUser.userDocument.budget_max}`;
          setValue('budget', budgetRange);
        }
      }
    }, [authUser?.userDocument?.statut, authUser?.userDocument?.type_logement, authUser?.userDocument?.zone, authUser?.userDocument?.budget_min, authUser?.userDocument?.budget_max, preferences, setValue, preferencesLoading]);

  if (!authUser || !authUser.userDocument) {
    console.log('[ProfileContainer] Pas d\'utilisateur ou userDocument, rien à afficher');
    return null;
  }

  // === LOGS DEBUG ===
  console.log('[DEBUG] authUser.userDocument :', authUser?.userDocument);
  console.log('[DEBUG] preferences (depuis usePreferences) :', preferences);
  // ==================

  const { name, surname } = authUser.userDocument;
  console.log('[ProfileContainer] Affichage du profil pour:', name, surname);
 
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
                setImagePreview(e.target?.result || null);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleImageUpload = async (): Promise<boolean> => {
        if (!selectedImage) return false;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedImage);

            const response = await fetch(`/api/profile/avatar?userId=${authUser.id}`, {
            method: 'POST',
                body: formData,
          });

            if (!response.ok) {
                toast.error("Erreur lors de la mise à jour de la photo");
                return false;
            }

            const { photourl } = await response.json();
            
            setImagePreview(`${photourl}?t=${new Date().getTime()}`);

            const newUserDocument = { ...authUser.userDocument, photourl };
            const updatedUser = { ...authUser, userDocument: newUserDocument };

            setAuthUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            toast.success("Photo de profil mise à jour !");
          setSelectedImage(null);
            return true;
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la mise à jour de la photo");
            return false;
        } finally {
          setLoading(false);
      }
    };

    const handleUpdateUserDocument = async (formData: UserProfilStepFormFieldsType): Promise<boolean> => {
      setLoading(true);
      try {
        const response = await fetch('/api/profile/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, id: authUser.id }),
        });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du profil');
            }
            const updatedData = await response.json();
            
            const newUserDocument = {
                ...authUser.userDocument,
                name: updatedData.name,
                surname: updatedData.surname,
            };
            const updatedUser = { ...authUser, userDocument: newUserDocument };

            setAuthUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            reset(formData);
        toast.success('Ton profil a été mis à jour avec succès');
            return true;
      } catch (error: any) {
        toast.error(error.message || 'Erreur lors de la mise à jour du profil');
            return false;
      } finally {
        setLoading(false);
      }
    };

    const handleUpdatePreferences = async (formData: UserProfilStepFormFieldsType): Promise<boolean> => {
      setLoading(true);
      try {
        // Préparer les préférences pour la sauvegarde (nouvelle logique : champ unique)
        const preferences = {
          statut: formData.statut || null,
          zone: formData.zone || null,
          type_logement: formData.type_logement || null,
          budget_min: null,
          budget_max: null
        };

        // Analyser le budget si sélectionné
        if (formData.budget) {
          const [min, max] = formData.budget.split('-').map(Number);
          if (!isNaN(min)) preferences.budget_min = min;
          if (!isNaN(max)) preferences.budget_max = max;
        }

        // Sauvegarder les préférences
        const response = await fetch('/api/profile/update-preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: authUser.id, 
            preferences 
          }),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la mise à jour des préférences');
        }

        // Rafraîchir le userDocument
        const userResponse = await fetch('/api/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.user) {
            setAuthUser(userData.user);
            localStorage.setItem('user', JSON.stringify(userData.user));
          }
        }

        toast.success('Vos préférences ont été mises à jour avec succès');
        return true;
      } catch (error: any) {
        toast.error(error.message || 'Erreur lors de la mise à jour des préférences');
        return false;
      } finally {
        setLoading(false);
      }
    };
 
    const onSubmit: SubmitHandler<UserProfilStepFormFieldsType> = async (formData) => {
        const currentName = authUser.userDocument?.name || "";
        const currentSurname = authUser.userDocument?.surname || "";

        const formChanged = 
            formData.name?.trim() !== currentName.trim() || 
            formData.surname?.trim() !== currentSurname.trim();

        const preferencesChanged = 
            formData.statut_student !== undefined ||
            formData.statut_professional !== undefined ||
            formData.statut_family !== undefined ||
            formData.statut_others !== undefined ||
            formData.type_logement_studio !== undefined ||
            formData.type_logement_apartment !== undefined ||
            formData.type_logement_house !== undefined ||
            formData.type_logement_villa !== undefined ||
            formData.zone !== undefined ||
            formData.budget !== undefined;

        if (!formChanged && !selectedImage && !preferencesChanged) {
            toast.info('Aucune modification détectée');
            return;
        }

        if (formChanged) {
            await handleUpdateUserDocument(formData);
        }

        if (preferencesChanged) {
            await handleUpdatePreferences(formData);
        }

      if (selectedImage) {
        await handleImageUpload();
      }
    };
    
    return (
        <ProfileView
        imagePreview={imagePreview}
        uploadProgress={uploadProgress}
        handleImageSelect={handleImageSelect}
        form={{
          errors,
          control,
          register,
          handleSubmit,
          onSubmit,
          isLoading: isLoading || preferencesLoading,
          setValue,
          watch
        }}
        preferences={preferences}
        preferencesLoading={preferencesLoading}
      />
    );
};