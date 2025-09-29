import { FormsType } from "@/types/forms";
import { Input } from "@/ui/design-system/forms/input";
import { Select } from "@/ui/design-system/forms/select";
import { Checkbox } from "@/ui/design-system/forms/checkbox";
import { QuestionnaireFormFields } from "@/types/onboarding-steps-List";

interface Props {
    form: FormsType;
    cities: string[];
    housingTypes: string[];
    budgetRanges: string[];
}

export const QuestionnaireStepForm = ({ form, cities, housingTypes, budgetRanges }: Props) => {
    const { register, errors, isLoading, control } = form;

    return (
        <form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input
                    label="Prénom"
                    isLoading={isLoading}
                    placeholder="Ex: MEME Jean"
                    type="text"
                    register={register}
                    errors={errors}
                    errorMsg="Ce champ est obligatoire"
                    id="name"
                    required={true}
                />

                <Select
                    label="Où voulez-vous séjourner ?"
                    isLoading={isLoading}
                    register={register}
                    errors={errors}
                    errorMsg="Ce champ est obligatoire"
                    id="destination"
                    required={true}
                    options={cities}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Select
                    label="Quel type d'appartement voulez-vous ?"
                    isLoading={isLoading}
                    register={register}
                    errors={errors}
                    errorMsg="Ce champ est obligatoire"
                    id="housingType"
                    required={true}
                    options={housingTypes}
                />

                <Select
                    label="Quel est votre budget par mois ?"
                    isLoading={isLoading}
                    register={register}
                    errors={errors}
                    errorMsg="Ce champ est obligatoire"
                    id="budget"
                    required={true}
                    options={budgetRanges}
                />
            </div>

            <div className="space-y-4">
                <label className="block font-medium">
                    Quels équipements vous sont indispensables ?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <Checkbox
                            label="Connexion internet"
                            register={register}
                            id="amenities.internet"
                        />
                        <Checkbox
                            label="Climatisation"
                            register={register}
                            id="amenities.airConditioning"
                        />
                        <Checkbox
                            label="Piscine"
                            register={register}
                            id="amenities.pool"
                        />
                        <Checkbox
                            label="Cuisine"
                            register={register}
                            id="amenities.kitchen"
                        />
                    </div>
                    <div className="space-y-3">
                        <Checkbox
                            label="Bureau"
                            register={register}
                            id="amenities.office"
                        />
                        <Checkbox
                            label="Ventilateur"
                            register={register}
                            id="amenities.fan"
                        />
                        <Checkbox
                            label="Brasseur"
                            register={register}
                            id="amenities.mixer"
                        />
                        <Checkbox
                            label="Salle de réception"
                            register={register}
                            id="amenities.receptionRoom"
                        />
                    </div>
                </div>
            </div>
        </form>
    );
}; 
 