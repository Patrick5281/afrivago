import { FormsType } from "@/types/forms";
import { Input } from "@/ui/design-system/forms/input";
import { Textarea } from "@/ui/design-system/forms/textarea";
import { Select } from "@/ui/design-system/forms/select";
import { FileUpload } from "@/ui/design-system/forms/file-upload";
import { useEffect, useState } from "react";

interface TypePiece {
  id: string; // UUID
  label: string; // Changé de 'nom' vers 'label'
}

interface Props {
    form: FormsType;
    existingTitreFoncier?: string; // URL du fichier titre foncier existant
}

export const ProfileStepForm = ({ form, existingTitreFoncier }: Props) => {
    const { register, errors, isLoading, control, setValue, watch } = form;
    const [typePieceOptions, setTypePieceOptions] = useState<{value: string, label: string}[]>([]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(true);

    // Charger les types de pièce depuis l'API
    useEffect(() => {
        const fetchTypePieces = async () => {
            try {
                console.log('[ProfileStepForm] Chargement des types de pièce...');
                const response = await fetch('/api/profile/pro/typepiece');
                if (response.ok) {
                    const typePieces: TypePiece[] = await response.json();
                    console.log('[ProfileStepForm] Types de pièce reçus:', typePieces);
                    const options = typePieces.map(type => ({
                        value: type.id, // UUID de la base
                        label: type.label // Utilise 'label' au lieu de 'nom'
                    }));
                    setTypePieceOptions(options);
                    console.log('[ProfileStepForm] Options formatées:', options);
                } else {
                    console.error('[ProfileStepForm] Erreur API:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('[ProfileStepForm] Erreur lors du chargement des types de pièce:', error);
                // Fallback en cas d'erreur API
                setTypePieceOptions([
                    { value: "", label: "Erreur de chargement" }
                ]);
            } finally {
                setIsLoadingTypes(false);
            }
        };

        fetchTypePieces();
    }, []);

    // Pour les fichiers, on utilise le state du formulaire (react-hook-form)
    const fichier_piece = watch ? watch("fichier_piece") || [] : [];
    const titre_foncier = watch ? watch("titre_foncier") || [] : [];

    return (
        <form className="w-full max-w-md space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Prénom"
                    isLoading={isLoading}
                    placeholder="Patrick"
                    type="text"
                    register={register}
                    errors={errors}
                    errorMsg="Vous devez renseigner votre prénom"
                    id="name"
                    required={true}
                />

                <Input 
                    label="Nom"
                    isLoading={isLoading}
                    placeholder="HOUNTON"
                    type="text"
                    register={register}
                    errors={errors}
                    errorMsg="Vous devez renseigner votre nom"
                    id="surname"
                    required={true}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    label="Type de pièce d'identité"
                    isLoading={isLoading || isLoadingTypes}
                    register={register}
                    errors={errors}
                    id="type_piece_id"
                    required={true}
                    options={typePieceOptions}
                    defaultOption="Sélectionner un type"
                />

                <Input
                    label="Numéro de la pièce"
                    isLoading={isLoading}
                    placeholder="Numéro d'identification"
                    type="text"
                    register={register}
                    errors={errors}
                    errorMsg="Vous devez renseigner le numéro de la pièce"
                    id="numero_piece"
                    required={true}
                />   
            </div>

            <FileUpload
                label="Titre foncier ou quittance (optionnel)"
                value={titre_foncier}
                onChange={files => setValue && setValue("titre_foncier", files)}
                required={false}
                errors={errors}
                id="titre_foncier"
                accept={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                maxSizeMo={5}
                isOptional={true}
                existingFile={existingTitreFoncier}
            />
        </form>
    );
};