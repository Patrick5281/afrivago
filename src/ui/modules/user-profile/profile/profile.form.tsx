import { FormsType } from "@/types/forms";
import { Button } from "@/ui/design-system/button/button";
import { Input } from "@/ui/design-system/forms/input";
import { Checkbox } from "@/ui/design-system/forms/checkbox";
import { Select } from "@/ui/design-system/forms/select";
import { Typography } from "@/ui/design-system/typography/typography";
import { UploadAvatar } from "../../upload-avatar/upload-avatar";
import { usePreferences } from "@/hooks/use-preferences";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

interface Props {
  imagePreview: string | ArrayBuffer | null ;
  uploadProgress: number; 
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void ;
  form: FormsType;
  isLocataire: boolean;
}

export const ProfileForm = ({ 
  imagePreview,
  uploadProgress,
  handleImageSelect,
  form,
  isLocataire
}: Props) => {
  const { register, errors, isLoading, onSubmit, handleSubmit, watch, setValue } = form;
  const { preferences, loading: preferencesLoading } = usePreferences();

  useEffect(() => {
    if (preferences?.status && preferences.status.length > 0) {
      setValue('statut', preferences.status[0].label);
    }
    if (preferences?.property_type && preferences.property_type.length > 0) {
      setValue('type_logement', preferences.property_type[0].label);
    }
  }, [preferences, setValue]);

  if (preferencesLoading || !preferences) {
    return <div>Chargement des préférences...</div>;
  }

  // Options pour les selects
  const zoneOptions = preferences?.zone?.map(zone => ({
    value: zone.label,
    label: zone.description || zone.label
  })) || [];

  const budgetOptions = preferences?.budget?.map(budget => ({
    value: budget.label,
    label: budget.description || budget.label
  })) || [];

  // Mapping explicite des valeurs attendues en base
  const statutOptions = [
    { label: 'Famille', value: 'family' },
    { label: 'Professionnel', value: 'professional' },
    { label: 'Autres', value: 'others' },
    { label: 'Étudiant', value: 'student' },
  ];
  const typeLogementOptions = [
    { label: 'Appartement', value: 'apartment' },
    { label: 'Studio', value: 'studio' },
    { label: 'Maison', value: 'house' },
    { label: 'Villa', value: 'villa' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      <div className="flex items-center justify-between py-5">
        <div>
          <UploadAvatar
            handleImageSelect={handleImageSelect} 
            imagePreview={imagePreview}
            uploadProgress={uploadProgress}
            isLoading={isLoading}
            variant="outline"
          />
        </div>
        <div className="flex items-end gap-1">
          
          <Typography
            variant="caption4"
            component="div"
            theme="gray-600"
            className="mb-3 text-white"
          >
            A
          </Typography>
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="space-y-4">
        <Typography variant="lead" component="h2">
          Informations personnelles
        </Typography>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-6 space-y-4">
            <Input
              label="Prénom"
              isLoading={isLoading}
              placeholder="Jhon Doe"
              type="text"
              register={register}
              errors={errors}
              errorMsg="Tu dois renseigner un prenom"
              id="name"
            />
          </div>
          <div className="col-span-6 space-y-4">
            <Input
              label="Nom"
              isLoading={isLoading}
              placeholder="Jhon Doe"
              type="text"
              register={register}
              errors={errors}
              errorMsg="Tu dois renseigner un nom"
              id="surname"
            />
          </div>
        </div>
      </div>

      {/* Préférences de logement */}
      {isLocataire && (
      <div className="space-y-4">
        <Typography variant="lead" component="h2">
          Préférences de logement
        </Typography>
        {/* Statut */}
        <div className="space-y-3">
          <Typography variant="body-base" component="p" theme="gray">
            Quel est votre statut ?
          </Typography>
          <div className="grid grid-cols-2 gap-4">
            {statutOptions.map((statut) => (
              <Checkbox
                key={statut.value}
                id={`statut_${statut.value}`}
                label={statut.label}
                checked={watch('statut') === statut.value}
                onChange={() => setValue('statut', statut.value)}
                register={register}
                errors={errors}
              />
            ))}
          </div>
        </div>
        {/* Type de logement */}
        <div className="space-y-3">
          <Typography variant="body-base" component="p" theme="gray">
            Quel type de logement préférez-vous ?
          </Typography>
          <div className="grid grid-cols-2 gap-4">
            {typeLogementOptions.map((type) => (
              <Checkbox
                key={type.value}
                id={`type_logement_${type.value}`}
                label={type.label}
                checked={watch('type_logement') === type.value}
                onChange={() => setValue('type_logement', type.value)}
                register={register}
                errors={errors}
              />
            ))}
          </div>
        </div>
        {/* Zone et Budget */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-6">
            <Select
              label="Zone préférée"
              isLoading={isLoading || preferencesLoading}
              register={register}
              errors={errors}
              errorMsg="Veuillez sélectionner une zone"
              id="zone"
              required={false}
              options={zoneOptions}
              defaultOption="Sélectionnez une zone"
            />
          </div>
          <div className="col-span-6">
            <Select
              label="Budget mensuel"
              isLoading={isLoading || preferencesLoading}
              register={register}
              errors={errors}
              errorMsg="Veuillez sélectionner un budget"
              id="budget"
              required={false}
              options={budgetOptions}
              defaultOption="Sélectionnez un budget"
            />
          </div>
        </div>
      </div>
      )}

      <div className="flex justify-end">
        <Button isLoading={isLoading || preferencesLoading} type="submit">
          Enregistrer
        </Button>
      </div>
    </form>
  );
};