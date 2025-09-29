import { FormsType } from "@/types/forms";
import { Role } from "@/types/roles";
import { Button } from "@/ui/design-system/button/button";
import { Input } from "@/ui/design-system/forms/input";
import { Select } from "@/ui/design-system/forms/select"; 
interface Props {
    form: FormsType;
    roles: Role[];
}

export const Registerform = ({ form, roles }: Props) => {
    const { control, onSubmit, errors, register, isLoading, handleSubmit } = form;
    
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="pt-8 pb-5 space-y-4">
            <Input
                isLoading={isLoading}
                placeholder="johnsmith@gmail.com"
                type="email"
                register={register}
                errors={errors}
                errorMsg="Tu dois renseigner ce champ"
                required
                id="email"
            />
            <Input
                isLoading={isLoading}
                placeholder="Mot de passe"
                type="password"
                register={register}
                errors={errors}
                errorMsg="Tu dois renseigner ce champ"
                required
                id="password"
            />
            
            {/* Nouveau champ pour sélectionner le rôle */}
                <Select
                isLoading={isLoading}
                label="Je m'inscris en tant que"
                register={register}
                errors={errors}
                errorMsg="Tu dois sélectionner un rôle"
                required
                id="roleId"
                options={roles.map(role => ({ value: role.id, label: role.nom }))}
                defaultOption="Sélectionner un rôle"
                />

            <Button type="submit" disabled={isLoading} isLoading={isLoading} fullwith>
                S'inscrire
            </Button>
        </form>
    );
};