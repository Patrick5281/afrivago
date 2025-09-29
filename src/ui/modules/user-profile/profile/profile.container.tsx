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
  const { value: isLoading, setValue: setLoading } = useToggle(); // Correction ici
  const { preferences, fetchPreferences, loading: preferencesLoading } = usePreferences();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(null);
  const preferencesFetchedRef = useRef(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    register,
    setValue,
    reset,
    watch
  } = useForm<UserProfilStepFormFieldsType>();

  useEffect(() => {
    if (!preferencesFetchedRef.current && !preferences && !preferencesLoading) {
      preferencesFetchedRef.current = true;
      fetchPreferences();
    }
  }, []);

  useEffect(() => {
    if (authUser && authUser.userDocument) {
      reset({
        name: authUser.userDocument.name,
        surname: authUser.userDocument.surname,
      });
      if (authUser.userDocument.photourl) {
        setImagePreview(`${authUser.userDocument.photourl}?t=${new Date().getTime()}`);
      }
    }
  }, [authUser, reset]);

  useEffect(() => {
    if (authUser?.userDocument && preferences && !preferencesLoading) {
      if (authUser.userDocument.statut) {
        setValue('statut', authUser.userDocument.statut);
      }
      if (authUser.userDocument.type_logement) {
        setValue('type_logement', authUser.userDocument.type_logement);
      }
      if (authUser.userDocument.zone) {
        setValue('zone', authUser.userDocument.zone);
      }
      if (authUser.userDocument.budget_min && authUser.userDocument.budget_max) {
        setValue('budget', `${authUser.userDocument.budget_min}-${authUser.userDocument.budget_max}`);
      }
    }
  }, [authUser, preferences, setValue, preferencesLoading]);

  if (!authUser || !authUser.userDocument) {
    return null;
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result || null);
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

      if (!response.ok) throw new Error('Erreur lors de la mise à jour du profil');
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
      const preferences = {
        statut: formData.statut || null,
        zone: formData.zone || null,
        type_logement: formData.type_logement || null,
        budget_min: null,
        budget_max: null
      };

      if (formData.budget) {
        const [min, max] = formData.budget.split('-').map(Number);
        if (!isNaN(min)) preferences.budget_min = min;
        if (!isNaN(max)) preferences.budget_max = max;
      }

      const response = await fetch('/api/profile/update-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: authUser.id, preferences }),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour des préférences');

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

    // Utilise les bons champs pour détecter les changements de préférences
    const preferencesChanged =
      formData.statut !== undefined ||
      formData.type_logement !== undefined ||
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
      uploadProgress={0}
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