import { FormsType } from "@/types/forms";
import { Input } from "@/ui/design-system/forms/input";
import { Textarea } from "@/ui/design-system/forms/textarea";

interface Props {
    form: FormsType;
}
export const ProfileStepForm = ({ form }: Props) => {
    const { register, errors, isLoading } = form;

    return (
        <form className="w-full max-w-md space-y-4">
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
                errorMsg="Vous devez renseigner votre prénom"
                id="surname"
                required={true}
            />

        </form>
    );
};