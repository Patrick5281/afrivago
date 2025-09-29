import { FormsType } from "@/types/forms";
import { Input } from "@/ui/design-system/forms/input";
import { Select } from "@/ui/design-system/forms/select";
import { Country } from "@/types/property";

interface Props {
    form: FormsType;
    countries: Country[];
}

export const GeneralInfoStepForm = ({ form, countries }: Props) => {
    const { register, errors, isLoading } = form;

    // Transformer les pays pour le composant Select
    const countryOptions = countries.map(country => ({
        label: country.name,
        value: country.id
    }));

    return (
        <form className="w-full max-w-md space-y-4">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Informations de base</h3>
                
                <Input
                    label="Titre de l'annonce"
                    isLoading={isLoading}
                    placeholder="ex: Magnifique appartement avec vue sur mer"
                    type="text"
                    register={register}
                    errors={errors}
                    errorMsg="Vous devez renseigner un titre pour votre logement"
                    id="title"
                    required={true}
                />

            </div>

            {/* Adresse et localisation */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Localisation</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <Select
                    label="Pays"
                    isLoading={isLoading}
                    options={countryOptions}
                    register={register}
                    errors={errors}
                    errorMsg="Vous devez sélectionner un pays"
                    id="country_id"
                    required={true}
                    />

                    <Input
                        label="Ville"
                        isLoading={isLoading}
                        placeholder="Paris"
                        type="text"
                        register={register}
                        errors={errors}
                        errorMsg="Vous devez renseigner la ville"
                        id="city"
                        required={true}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <Input
                    label="Adresse complète"
                    isLoading={isLoading}
                    placeholder="123 Rue de la République"
                    type="text"
                    register={register}
                    errors={errors}
                    errorMsg="Vous devez renseigner l'adresse du logement"
                    id="full_address"
                    required={true}
                    />
                    <Input
                        label="Code postal"
                        isLoading={isLoading}
                        placeholder="75001"
                        type="text"
                        register={register}
                        errors={errors}
                        errorMsg="Vous devez renseigner un code postal valide"
                        id="postal_code"
                        required={true}
                    />
                </div>
            </div>

            {/* Caractéristiques du logement */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Caractéristiques</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Surface habitable (m²)"
                        isLoading={isLoading}
                        placeholder="85"
                        type="int"
                        register={register}
                        errors={errors}
                        errorMsg="Vous devez renseigner la surface du logement"
                        id="surface"
                        required={true}
                    />

                    <Input
                        label="Année de construction"
                        isLoading={isLoading}
                        placeholder="1995"
                        type="int"
                        register={register}
                        errors={errors}
                        errorMsg="Vous devez renseigner l'année de construction"
                        id="year_built"
                        required={false}
                    />
                </div>

            </div>
        </form>
    );
};